use std::ffi::CString;
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn get_salam() -> *mut c_char {
    let s = CString::new("Assalamu'alaikum dari Aumo Core (Rust FFI)").unwrap();
    s.into_raw()
}
