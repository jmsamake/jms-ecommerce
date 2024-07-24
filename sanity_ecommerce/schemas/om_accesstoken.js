export default {
    name: 'om_accesstoken',
    title: 'OM Access Token',
    type: 'document',
    
    fields: [
      { 
        name: 'name',
        title: 'Config Name',
        type: 'string',
      },
      { 
        name: 'auth_url',
        title: 'URL',
        type: 'string',
      },	
      { 
        name: 'authorisation',
        title: 'Authorisation',
        type: 'string',
      },
      { 
        name: 'content_type',
        title: 'Content-Type',
        type: 'string',
      },
      { 
        name: 'access_token',
        title: 'Access Token',
        type: 'string',
      },	
      { 
        name: 'grant_type',
        title: 'Grant type',
        type: 'string',
      },
      {
        name: 'last_updated',
        title: 'Last Updated',       
        type: 'datetime'
      }
    ]
}