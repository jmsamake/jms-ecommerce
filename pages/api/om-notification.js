import { client } from "../../lib/client";

export default async function handler(req, res) {
    
    const insertOmNotifRec = async (doc) => { 
        console.log("APILOG::insertOmNotifRec::B4 call to client.create(doc), with Docdocument data below:"); 
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

    if (req.method === 'POST') {
        console.log("APILOG::om-notification api::handler::in POST route, B4 Call with notif token::"+req.body.notif_token); 
        //console.log("APILOG::om-notification api::handler::in POST route, B4 Call state token::omNotifToken"); 
        //TODO: need to compare incouming notif_token to previous notif_token
        if (req.body.notif_token === "omNotifToken") {
            console.log("APILOG::om-notification::handler::POST route::Notif Token mismatch, the Trx cannot be validated!!!"); 
            res.status(400).json({name: 'Hello from POST Notification REST API::Notif Token mismatch, the Trx cannot be validated!!!',
                                 status: "FAILED",                               
                                 error_code: 43  })
            return;
        }
        // TODO: fetch from body vars
        const doc = { 
            _type: "om_notification",   
            status: `${req.body.status}`,    
            notif_token: `${req.body.notif_token}`,
            txnid: `${req.body.txnid}`,
            lastupdate: `${new Date()}`
        };   

        const newDocId = await insertOmNotifRec(doc);   
        console.log("APILOG::om-notification::handler::POST route::After Call insertOmNotifRec"); 
        // return full json data here   
        if (req.body.status === 'SUCCESS') {
            res.status(200).json({name: 'Hello from POST Notification REST API::SUCCESS',
                                status: "SUCCESS",   
                                doc_id: `${newDocId}`,                            
                                error_code: 42  }) 
        }
        else {
            res.status(200).json({name: 'Hello from POST Notification REST API::FAILED',
                                status: "FAILED",                               
                                error_code: 43  })
        }
        
    }
    else {
        console.log("APILOG::om-webpay api::handler::in OTHER route");
        res.status(400).json({ name: 'Hello from POST Webpay REST API',                           
                            error_code: 43  })
    }
}