import { client } from "../../lib/client";


export default async function handler(req, res) {

    const fetchOmToken = async () => {
        // Joes:: watch for hardcode "om_access_token_v3" om-webpay-dev-v1
        const tokenQuery = '*[_type=="om_accesstoken" && name=="om_access_token_v3"] {_id, auth_url, authorisation, content_type, access_token, grant_type, last_updated}';
        console.log("APILOG::fetchOmToken::B4 client.fetch() to Sanity.io") ; 
        const om_token = await client.fetch(tokenQuery);  
        //console.log(om_token) ;  
        return om_token[0];
    };

    const fetchOmWebPayParams = async () => {
        // Joes:: watch for hardcode "om_webpay_dev_v1" 
        const tokenQuery = '*[_type=="om_webpay" && name=="om_webpay_dev_v1"] {_id, payment_url, merchant_key, currency, return_url, cancel_url, notif_url, lang, reference}';
        console.log("APILOG::fetchOmWebPayParams::B4 client.fetch() to Sanity.io") ; 
        const ret_data = await client.fetch(tokenQuery);  
        //console.log(om_token) ;  
        return ret_data[0];
    };

    // _id param is the Sanity.io doc id
    const updateOmToken = async (_id, token) => {
        const result = await client.patch(_id).set({access_token: token, last_updated: new Date()}).commit();
        // returns the updated record doc
        return result;
    };

    // _id param is the Sanity.io doc id
    const insertOmPayRec = async (doc) => { 
        console.log("APILOG::insertOmPayRec::B4 call to client.create(doc), with Docdocument data below:"); 
        console.log(doc); 
        let ret_val = "InvalidDocIdReturnedFromSanity";  

        await client.create(doc).then((res) => {
            console.log(`APILOG::insertOmPayRec::WEBPAY REC was created, document ID is ${res._id}`);
            console.log(res);  
            ret_val =  res._id;       
        })
        // returns the inserted record doc
        return ret_val;
    };

    switch (req.method) { 
        
        case "GET":
            console.log("APILOG::om-sanity::handler::switch::in GET route, B4 Call"); 
            //console.log(req.headers);
            if (req.headers.opcode == "GET_ACCESS_TOKEN") {
                const tokenObj = await fetchOmToken();   
                console.log("APILOG::om-sanity::handler::switch::GET route::GET_ACCESS_TOKEN opcode::After Call fetchOmToken::"); 
                res.status(200).json({ name: 'Hello from GET om-sanity REST API for GET_ACCESS_TOKEN opcode',
                                    doc_id: tokenObj._id,
                                    doc_url: tokenObj.auth_url,
                                    doc_auth: tokenObj.authorisation,
                                    doc_token: tokenObj.access_token,
                                    doc_content_type: tokenObj.content_type,
                                    doc_grant_type: tokenObj.grant_type,
                                    doc_last_update: tokenObj.last_updated,
                                    error_code: 42 });                
            } 
            else if (req.headers.opcode == "GET_WEBPAY_PARAMS") {
                const sanityDoc = await fetchOmWebPayParams();   
                console.log("APILOG::om-sanity::handler::switch::GET route::GET_WEBPAY_PARAMS opcode::After Call fetchOmWebPayParams::"); 
                // const tokenQuery = '{_id, payment_url, merchant_key, currency, return_url, cancel_url, notif_url, lang, reference}';
                res.status(200).json({ name: 'Hello from GET om-sanity REST API for GET_WEBPAY_PARAMS opcode',
                                    doc_id: sanityDoc._id,
                                    doc_payment_url: sanityDoc.payment_url,
                                    doc_merchant_key: sanityDoc.merchant_key,
                                    doc_currency: sanityDoc.currency,
                                    doc_return_url: sanityDoc.return_url,
                                    doc_cancel_url: sanityDoc.cancel_url,
                                    doc_notif_url: sanityDoc.notif_url,
                                    doc_lang: sanityDoc.lang,
                                    doc_ref: sanityDoc.reference,
                                    error_code: 42 });                
            }          
            else {
                console.log("APILOG::om-sanity::handler::switch::GET route::GET_ACCESS_TOKEN opcode::ERROR"); 
                res.status(200).json({ name: 'Hello from GET om-sanity REST API for GET_ACCESS_TOKEN opcode::SERVER ERROR!!!',                                    
                                       error_code: 400  }); 
            }
            break;
        case "PUT":
            if (req.body.opcode == "UPD_ACCESS_TOKEN") {
                console.log("APILOG::om-sanity::handler::switch::in PUT route, B4 Call to updateOmToken"); 
                const newOmToken = await updateOmToken(req.body.doc_id, req.body.access_token); 
                //console.log(newOmToken);  
                //console.log("APILOG::om-sanity::handler::switch::in PUT route, After Call to updateOmToken"); 
                res.status(200).json({ name: 'Hello from PUT om-sanity REST API::updateOmToken',
                                       api_message: "SANITY_UPDTOKEN_SUCCESS",
                                       error_code: 42 })
            }
            else if (req.body.opcode == "POST_WEBPAY_RECORD") {
                const doc = { 
                    _type: "om_webpay_rec",   
                    status: `${req.body.status}`,
                    message: `${req.body.message}`,
                    pay_token: `${req.body.pay_token}`,
                    payment_url: `${req.body.payment_url}`,
                    notif_token: `${req.body.notif_token}`,
                    order_id: `${req.body.order_id}`,
                    rec_time: `${new Date()}`
                };
                const result = await insertOmPayRec(doc);   
                console.log("APILOG::om-sanity::handler::switch::GET route::POST_WEBPAY_RECORD opcode::After Call insertOmPayRec"); 
                console.log(result);
                res.status(200).json({ name: 'Hello from GET om-sanity REST API for POST_WEBPAY_RECORD opcode',
                                    doc_id: result,                                                                     
                                    error_code: 42 });                
            }
            else {
                console.log("APILOG::om-sanity::handler::switch::PUT route::UPD_ACCESS_TOKEN opcode::ERROR"); 
                res.status(400).json({ name: 'Hello from GET om-sanity REST API for UPD_ACCESS_TOKEN opcode::SERVER ERROR',                                    
                                       error_code: 400 }); 
            }
            break;           

    }

}