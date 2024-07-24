// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    const { title, post } = JSON.parse(req.body);
  
    // access_token = self.get_om_access_token()
    // authorization = 'Bearer {access_token}'.format(access_token=access_token)
    // const requestHeaders = new Headers(request.headers)
    // res.setHeader('Authorization', 'authorization');
    // res.setHeader('Content-Type', 'application/json');
    // Then save the post data to a database
    res.status(200).json({ message: "Post created successfully" });
  }
