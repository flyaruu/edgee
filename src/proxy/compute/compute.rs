use crate::config::config;
use crate::proxy::compute::data_collection::data_collection;
use crate::proxy::compute::html::{parse_html, Document};
use crate::proxy::proxy::set_edgee_header;
use crate::tools;
use crate::tools::edgee_cookie;
use crate::tools::edgee_cookie::EdgeeCookie;
use bytes::Bytes;
use http::header::CACHE_CONTROL;
use http::response::Parts;
use http::uri::PathAndQuery;
use http::{HeaderMap, HeaderName, HeaderValue};
use std::str::FromStr;
use tracing::warn;

pub async fn html_handler(
    body: &String,
    host: &String,
    path: &PathAndQuery,
    request_headers: &HeaderMap,
    proto: &str,
    client_ip: &String,
    response_parts: &mut Parts,
    response_headers: &HeaderMap,
) -> Result<Document, &'static str>
{
    // if the decompressed body is too large, abort the computation
    if body.len() > config::get().compute.max_decompressed_body_size {
        warn!("decompressed body too large: {} > {}", body.len(), config::get().compute.max_decompressed_body_size);
        Err("compute-aborted(decompressed-body-too-large)")?;
    }

    // check if `id="__EDGEE_SDK__"` is present in the body
    if !body.contains(r#"id="__EDGEE_SDK__""#) {
        Err("compute-aborted(no-sdk)")?;
    }

    let mut document = parse_html(&body);

    // verify if document.sdk_full_tag is present, otherwise SDK is probably commented in the page
    if document.sdk_full_tag.is_empty() {
        Err("compute-aborted(commented-sdk)")?;
    }

    // enforce_no_store_policy is used to enforce no-store cache-control header in the response for requests that can be computed
    if config::get().compute.enforce_no_store_policy {
        response_parts.headers.insert(
            HeaderName::from_str(CACHE_CONTROL.as_ref()).unwrap(),
            HeaderValue::from_str("no-store").unwrap(),
        );
    }

    match do_process_payload(&path, request_headers, response_headers) {
        Ok(_) => {
            let cookie = edgee_cookie::get(&request_headers, &mut HeaderMap::new(), &host);
            if cookie.is_none() {
                set_edgee_header(response_parts, "compute-aborted(no-cookie)");
            } else {
                let data_collection_trace_uuid = data_collection::process_from_html(&document, &cookie.unwrap(), proto, &host, &path, &request_headers, client_ip).await;
                if data_collection_trace_uuid.is_some() {
                    document.trace_uuid = data_collection_trace_uuid.unwrap();
                }
            }
        }
        Err(reason) => {
            set_edgee_header(response_parts, reason);
        }
    }

    Ok(document)
}

pub async fn json_handler(body: &Bytes, cookie: &EdgeeCookie, path: &PathAndQuery, request_headers: &HeaderMap, client_ip: &String) {
    data_collection::process_from_json(body, &cookie, &path, &request_headers, client_ip).await;
}

/// Processes the payload of a request under certain conditions.
///
/// This function checks for several conditions before processing the payload of a request.
/// If any of these conditions are met, the function will abort the computation and return an error.
///
/// # Arguments
///
/// * `path` - A reference to the path
/// * `response_headers` - A reference to the response headers.
///
/// # Returns
///
/// * `Result<bool, &'static str>` - Returns a Result. If the payload is processed successfully, it returns `Ok(true)`.
/// If any of the conditions are met, it returns `Err` with a string indicating the reason for the computation abort.
///
/// # Errors
///
/// This function will return an error if:
///
/// * The `disableEdgeDataCollection` query parameter is present in the URL of the request.
/// * The response is cacheable.
/// * The request is for prefetch (indicated by the `Purpose` or `Sec-Purpose` headers).
fn do_process_payload(path: &PathAndQuery, request_headers: &HeaderMap, response_headers: &HeaderMap) -> Result<bool, &'static str> {
    // do not process the payload if disableEdgeDataCollection query param is present in the URL
    let query = path.query().unwrap_or("");
    if query.contains("disableEdgeDataCollection") {
        Err("compute-aborted(disableEdgeDataCollection)")?;
    }

    if !config::get().compute.enforce_no_store_policy {
        // process the payload, only if response is not cacheable
        // transform response_headers to HashMap<String, String>
        let res_headers = response_headers.iter().map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap().to_string())).collect::<std::collections::HashMap<String, String>>();
        if tools::cacheable::check_cacheability(&res_headers, config::get().compute.behind_proxy_cache) {
            Err("compute-aborted(cacheable)")?;
        }
    }

    // do not process the payload if the request is for prefetch
    let purpose = request_headers.get("purpose").and_then(|h| h.to_str().ok()).unwrap_or("");
    let sec_purpose = request_headers.get("sec-purpose").and_then(|h| h.to_str().ok()).unwrap_or("");
    if purpose.contains("prefetch") || sec_purpose.contains("prefetch") {
        Err("compute-aborted(prefetch)")?;
    }

    Ok(true)
}
