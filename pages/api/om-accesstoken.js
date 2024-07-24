// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
  
  var urlencoded = new URLSearchParams();

  const getAccessToken = async () => {
    console.log(req.body);   
    urlencoded.append("grant_type", req.body.grant_type);
    
    const response = await fetch(req.body.url, {
      method: "POST",    
      headers: {
        'Authorization': `${req.body.authorization}`,
        'Content-Type': `${req.body.content_type}`,
        'Accept': 'application/json',
      },
      body: urlencoded,
    });

    if(response.statusCode === 500) return;
    
    const data = await response.json();
    // TODO: handle exceptions conditions
    console.log("APILOG::handler::getAccessToken::data::");
    console.log(data);
    return data.access_token;
  };

  if (req.method === 'POST') {
    console.log("APILOG::handler::in REST POST route, B4 call to getAccessToken()");
    //getAccessToken().then((resp) => { 
    const dataStr = await getAccessToken();    
    console.log("APILOG::handler::AccessToken::"+dataStr); 
    res.status(200).json({ name: 'Hello from POST AccessToken REST API',
                           api_message: dataStr,
                           error_code: 42  })
  }
  else {
    console.log("APILOG::handler::in Undefined REST route");
    res.status(200).json({ name: 'Hello from GET Endpoint' })
  }
}