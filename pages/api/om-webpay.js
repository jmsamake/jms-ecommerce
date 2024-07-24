// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
  
  const handleCheckoutMomo = async () => {
    var timestampStr = new Date().getTime();
    //console.log(req.body)
    // setLoadingStartTime(new Date().getTime());

    // follows OM API specs
    const params = {
      merchant_key: `${req.body.merchant_key}`,
      currency: `${req.body.currency}`,  
      order_id: "TRXID_"+timestampStr+`_0${req.body.order_id}`,    
      amount: `${req.body.amount}`,
      return_url: `${req.body.return_url}`,
      cancel_url: `${req.body.cancel_url}`,
      notif_url: `${req.body.notif_url}`,
      lang: `${req.body.lang}`,
      reference: `${req.body.reference}`,
    };

    //console.log(params);

    console.log("APILOG::om-webpay::handler::handleCheckoutMomo::B4 call to OM webpay API with params above");
    //const response = await fetch("https://api.orange.com/orange-money-webpay/dev/v1/webpayment", {
    const response = await fetch(req.body.payment_url, {
        method: "POST",
        headers: {    
          'Authorization': `${req.body.auth_bearer}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if(response.statusCode === 500) {
        console.log("APILOG::om-webpay::handler::handleCheckoutMomo::statusCode::500");
        console.log(data);
        return;
    }

    const data = await response.json();
       
    if(data.status === 201) {      
      console.log("APILOG::om-webpay::handler::handleCheckoutMomo::statusCode:201::data :: "+data.message);
      // Joes log data to db, or return to calling fct for log
      console.log(data);
      //return data.payment_url; status; message; pay_token; notif_token
      return data;
      // joes: return success, so that data can be constructed and posted to sanity om webpay rec
    }
    else if (data.code === undefined) {
      console.log("APILOG::om-webpay::handler::handleCheckoutMomo::data code undefined path 1 :: "+data.code);
      console.log(data);
      return data;
    }
    else if (data.code === 23 || data.code === 24) { // Expired or Invalid credentials
      console.log("APILOG::om-webpay::handler::handleCheckoutMomo::error::"+data.message);
      console.log(data);
      //TODO: set things up to get new access token
      return data;
    }
    else if (data.code === 1204) { // Order already exists
      console.log("APILOG::om-webpay::handler::handleCheckoutMomo::error ::"+data.message);
      console.log(data);
      return data;
    }
    else {
      console.log("APILOG::om-webpay::handler::handleCheckoutMomo::data code undefined, last path::"+data.code);
      console.log(data);
      return data;
    }
     
  };
  // END of FCT handleCheckoutMomo

  if (req.method === 'POST') {
    console.log("APILOG::om-webpay api::handler::in POST route, B4 Call"); 
    // return full json data here
    const data = await handleCheckoutMomo();   
    console.log("APILOG::om-webpay api::handler:: After handleCheckoutMomo call, with notif token::"+data.notif_token); 
    // joes create Doc that need to be posted to sanity om pay rec
    // data.payment_url; status; message; pay_token; notif_token
    res.status(200).json({ name: 'Hello from POST Webpay REST API',
                           status: data.status,
                           payment_url: data.payment_url,
                           message: data.message,
                           pay_token: data.pay_token,
                           notif_token: data.notif_token,
                           error_code: 42  })
  }
  else {
    console.log("APILOG::om-webpay api::handler::in OTHER route");
    res.status(400).json({ name: 'Hello from POST Webpay REST API',
                           status: "_STATUS",
                           payment_url: "_PAYMENT_URL",
                           message: "_MESSAGE",
                           pay_token: "_PAY_TOKEN",
                           notif_token: "_NOTIF_TOKEN",
                           error_code: 43  })
  }
}