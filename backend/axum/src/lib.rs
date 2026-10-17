use std::ffi::CString;
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn get_salam() -> *mut c_char {
    let message = CString::new("Salam dari Rust Core Native (FFI)!").unwrap();
    message.into_raw()
}

#[no_mangle]
pub extern "C" fn free_salam(s: *mut c_char) {
    if s.is_null() { return; }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
