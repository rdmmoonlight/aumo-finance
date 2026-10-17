use serde::Serialize;
use std::ffi::CString;
use std::os::raw::c_char;

#[derive(Serialize)]
struct SalamResponse {
    message: String,
    service: String,
    version: String,
    status: String,
}

#[no_mangle]
pub extern "C" fn get_salam() -> *mut c_char {
    let response = SalamResponse {
        message: "Assalamu'alaikum dari Aumo Core (Rust FFI)".to_string(),
        service: "aumo-core".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        status: "ready".to_string(),
    };

    let json = serde_json::to_string(&response).unwrap_or_default();
    CString::new(json).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn free_string(s: *mut c_char) {
    if s.is_null() {
        return;
    }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
