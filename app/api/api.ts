// import {BASE_URL} from "@/env";
const BASE_URL = "https://api.linkmerkato.com.et/api/v1";
//const BASE_URL = "https://linkmerkato.onrender.com/api/v1";
// register api
export const register_api = `${BASE_URL}/auth/register`; 
// login api
export const login_api = `${BASE_URL}/auth/login`;
//forgot password api
export const forget_password_Base_url = "https://api.import.linkmerkato.com.et/api/v1"


// im[ort export api
export const BASE_API_URL= "https://api.import.linkmerkato.com.et";



export const request_otp_api = `${forget_password_Base_url}/auth/request-otp`;
export const verify_otp_api = `${forget_password_Base_url}/auth/verify-otp`;
export const forgot_password_api = `${forget_password_Base_url}/auth/changepassword`;
export const resend_otp_api = `${forget_password_Base_url}/auth/resendotp`;
// upload data api

export const local_receipt = `${BASE_URL}/user/localReceiptDocument`; 
export const export_receipt = `${BASE_URL}/user/exportDocuments`; 
export const import_receipt = `${BASE_URL}/user/importDocuments`;
export const custom_receipt = `${BASE_URL}/user/customReceiptDocument`;
//user data fetch api
export const local_data_fetch_api = `${BASE_URL}/user/receiptsLocal`;
export const export_data_fetch_api = `${BASE_URL}/user/receiptsExport`;
export const import_data_fetch_api = `${BASE_URL}/user/receiptsImport`;
export const custom_data_fetch_api = `${BASE_URL}/user/receiptsCustom`;

// admin api
export const admin_local_receipt_api = `${BASE_URL}/admin/localReceiptData`;
export const admin_export_receipt_api = `${BASE_URL}/admin/exportdocument`;
export const admin_import_receipt_api = `${BASE_URL}/admin/importdocument`;
export const admin_custom_receipt_api = `${BASE_URL}/admin/customReceiptData`;
