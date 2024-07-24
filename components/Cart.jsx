import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping } from 'react-icons/ai';
import { TiDeleteOutline } from 'react-icons/ti';
import toast from 'react-hot-toast';

import { useStateContext } from '../context/StateContext';
import { urlFor } from '../lib/client';
import getStripe from '../lib/getStripe';

const Cart = () => {
  
  const cartRef = useRef();
  const {totalPrice, totalQuantities, omAccessToken, omNotifToken, orderIdSeq, cartItems, setShowCart, toggleCartItemQuanitity, incOrderIdSeq, onRemove, onAccessTokenChange, setOmNotifToken} = useStateContext();
  const router = useRouter();
  var bearer_auth_str = "Cart InvalidToken";
  var sanity_om_at_doc_id = "CartInvalidDocId";
 
  const omCartAccessTokenParams = {
    doc_id: "CartInvalidDocId",
    url: "CartInvalidDocUrl",
    authorization: "CartInvalidAuth",   
    access_token: "CartInvalidAccessToken", 
    content_type: "CartInvalidContentType",
    grant_type: "CartInvalidContentType",
    last_update: "CartInvalidLastUpdate",
  };

  const omCartWebPayParams = {
    doc_id: "CartInvalidDocId",
    payment_url: "CartInvalidPaymentUrl",
    merchant_key: "CartInvalidMerchantKey",   
    currency: "CartInvalidCurrency", 
    return_url: "CartInvalidReturnUrl",
    cancel_url: "CartInvalidCancelUrl",
    notif_url: "CartInvalidNotifUrl",
    lang: "CartInvalidLastLang",
    ref: "CartInvalidLastRef",
  };

  const handleCheckoutMomo = async () => {

    const postData = async () => {
      const params = {
        merchant_key: "aa65003c",
        currency: "OUV",
        order_id: "ORDER_ID_JMS_99917042024",       
        amount: `${totalPrice}`,
        //return_url: `${req.headers.origin}/success`,
        return_url: "https://jms-ecommerce.sanity.studio/desk",
        cancel_url: "https://jms-ecommerce.sanity.studio/desk",
        notif_url: "https://jms-ecommerce.sanity.studio/desk",
        lang: "fr",
        reference: "JMS Store Cart"
      };

      //console.log(params);
      const response = await fetch("https://api.orange.com/orange-money-webpay/dev/v1/webpayment", {
        method: "POST",
        headers: {
          'Authorization': 'Bearer eyJ2ZXIiOiIxLjAiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCIsImtpZCI6ImRzRUN2TDVaTENQbTl1R081RHltUjZCRTdMcnFGak5hX1VKbl9Ody1zdVUifQ.eyJhcHBfbmFtZSI6ImRzdG91Y2ggc3RvcmUiLCJzdWIiOiJpYkc1R24zc0Q2RnZRMmtaTUltV2toUW9MMkFvcDhEMyIsImlzcyI6Imh0dHBzOlwvXC9hcGkub3JhbmdlLmNvbVwvb2F1dGhcL3YzIiwiZXhwIjoxNzE1Njg3NjYyLCJhcHBfaWQiOiJ2cUM1djc3Y0FGMHU4a1hvIiwiaWF0IjoxNzE1Njg0MDYyLCJjbGllbnRfaWQiOiJpYkc1R24zc0Q2RnZRMmtaTUltV2toUW9MMkFvcDhEMyIsImp0aSI6IjhmZmU0MmU2LTU1NzktNDMwMy04YjZhLWM5NzlmZDAwNmFmZCJ9.cE6yqMSnxgf2doe5fU2jD_dDyrD4Lbw1fB6DyvGm9Kl7hGQOk_mmzqQbINBRB7jowxaJXt2CQO-nix9GN6aPEXDQUSCjsdkV9uTzZ7VzwhlEI6u32FBqKUuK40ig9Qir',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      return response.json();
    };
    
    postData().then((resp) => {
      console.log(resp);
      //alert(resp.payment_url);
      router.push(resp.payment_url);
    });
  }

  const handleMomoApi = async () => {  
    await incOrderIdSeq();
    
    // verify validity of acccess token on each momo trx call
    const tokenData = await getOmTokenFromSanity();
    omCartAccessTokenParams.access_token = tokenData.doc_token;
    const tmp_bearer_str = "Bearer "+omCartAccessTokenParams.access_token;
    //await onAccessTokenChange(bearer_auth_str);
    console.log("Cart::handleMomoApi::omAccessToken is currently::"+tmp_bearer_str);

    const omParams = await getOmWebpayParamsFromSanity();
    const webpayData = await handleOmWebpay(tmp_bearer_str);
    console.log(webpayData);
    
    if (webpayData.message === undefined) {
      console.log("Cart::handleMomoApi::returned from Webpay API call::Error!!!::undefined api msg");
      console.log(webpayData);
      return;
    } // webpayData.payment_url?.slice(0, 16)
    else if (webpayData.payment_url?.slice(0, 16) === 'https://mpayment') {
      //TODO: path where accessToken is valid, so reuse
      console.log("Cart::handleMomoApi::returned from Webpay API call::Success, with notif token::"+webpayData.notif_token);
      // udpate only if valid at OM API touchpoint
      await onAccessTokenChange(tmp_bearer_str);
      //JOES::testing apis LOG to sanity db here???
      await setOmNotifToken(webpayData.notif_token);
      const notifData = await handleOmWebpayNotif(webpayData.notif_token);
      if (notifData.status === "SUCCESS") {
        createOmPayRecToSanity(webpayData);
      }  
          
      //const notifData = await handleOmWebpayNotif();
      router.push(webpayData.payment_url);
      // JOES: need to create a promise here to come back to log to sanity upon success, i.e compare notif_token
      //TODO: save notif_token in session for later cmp op in OM notification; useStateContext states
    }
    else if (webpayData.message == 'Expired credentials' || 
             webpayData.message == 'Invalid credentials' ||
             webpayData.message == 'Missing credentials' ) {
      // get new access token from OM auth API
      const newTokenStr = await handleMomoToken(); 
      omCartAccessTokenParams.access_token = newTokenStr;
      
      const sanityCallStr = await updateOmTokenToSanity();
      if (sanityCallStr === "InvalidSanityDocId") {
        console.log("Cart::handleMomoApi::AFTER call to updateOmTokenToSanity :: InvalidSanityDocId");
        return;
      }
       
      console.log("Cart::handleMomoApi::Reset Access Token::After call to updateOmTokenToSanity::"+sanityCallStr);
      const webpayData2 = await handleOmWebpay("Bearer "+omCartAccessTokenParams.access_token);
     
      //console.log(webpayData2);
      if (webpayData2.payment_url?.slice(0, 16) === 'https://mpayment') {
        console.log("Cart::handleMomoApi::returned from 2nd handleOmWebpay API call::Success with notif token::"+webpayData2.notif_token);
        //await onAccessTokenChange(omCartAccessTokenParams.access_token);
        await createOmPayRecToSanity(webpayData2);
        await setOmNotifToken(webpayData2.notif_token);
        await handleOmWebpayNotif(webpayData2.notif_token);
        //TODO: save notif_token in session for later cmp op in OM notification        
        //await handleOmWebpayNotif(webpayData2.notif_token);
        router.push(webpayData2.payment_url);
      }
      else {
        console.log("Cart::handleMomoApi::AFTER call to 2nd handleOmWebpay api :: Else path, unknown api message :: "+webpayData2.message);
        return;
      }        
    }
    else if (webpayData.message == 'Order already exists' || 
             webpayData.message == 'Missing body field'  ) {
      console.log("Cart::handleMomoApi::AFTER call to 1st handleOmWebpay api :: NON ACCESS TOKON Error:: "+webpayData.message);
      return;
    }          
    else {
      console.log("Cart::handleMomoApi::AFTER call to 1st handleOmWebpay api :: Else path, unknown api message :: "+webpayData.message);
      return;
    }
    //
  }

  useEffect(() => {
    if (omAccessToken === "StateContext InvalidToken"){
      console.log("Cart::useEffect::omAccessToken value was re-init::StateContext InvalidToken::");
      return;
    }
    else {
      omCartAccessTokenParams.access_token = omAccessToken;
      console.log("Cart::useEffect::omAccessToken value was udpated::"+omAccessToken);
      return;
    }   
  }, [omAccessToken]);

  const handleMomoToken = async () => {
      const params = {
        url: `${omCartAccessTokenParams.url}`,
        authorization: `${omCartAccessTokenParams.authorization}`,
        content_type: `${omCartAccessTokenParams.content_type}`,
        grant_type: `${omCartAccessTokenParams.grant_type}`
      };

      const resp = await fetch('/api/om-accesstoken', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',        
        },
        body: JSON.stringify(params),
      });

      if(resp.statusCode === 500) return;
    
      const token_data = await resp.json();      
      console.log(token_data);
      console.log("Cart::handleMomoToken::AFTER call to fetch /api/om-accestoken api :: "+token_data.api_message);
      return token_data.api_message;
  }

  const getOmTokenFromSanity = async () => {
    
    const resp = await fetch('/api/om-sanity', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',  
        'opcode': 'GET_ACCESS_TOKEN',       
      }
    });

    if(resp.statusCode === 500) return;
  
    const token_data = await resp.json();      
    console.log(token_data);
    
    omCartAccessTokenParams.doc_id = token_data.doc_id;
    omCartAccessTokenParams.url = token_data.doc_url;
    omCartAccessTokenParams.access_token = token_data.doc_token;
    omCartAccessTokenParams.authorization = token_data.doc_auth;
    omCartAccessTokenParams.content_type = token_data.doc_content_type;
    omCartAccessTokenParams.grant_type = token_data.doc_grant_type;
    omCartAccessTokenParams.last_update = token_data.doc_last_update;
    //await setOmAccessTokenDocId(omCartAccessTokenParams.doc_id);
    console.log("Cart::getOmTokenFromSanity::AFTER call to fetch /api/om-sanity api :: "+omCartAccessTokenParams.doc_id);

    return token_data;
  }

  const getOmWebpayParamsFromSanity = async () => {

    const resp = await fetch('/api/om-sanity', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',  
        'opcode': 'GET_WEBPAY_PARAMS',       
      }
    });

    if(resp.statusCode === 500) return;
  
    const data = await resp.json();      
    console.log(data);
    
    omCartWebPayParams.doc_id = data.doc_id;
    omCartWebPayParams.payment_url = data.doc_payment_url;
    omCartWebPayParams.merchant_key = data.doc_merchant_key;
    omCartWebPayParams.currency = data.doc_currency;
    omCartWebPayParams.return_url = data.doc_return_url;
    omCartWebPayParams.cancel_url = data.doc_cancel_url;
    omCartWebPayParams.notif_url = data.doc_notif_url;
    omCartWebPayParams.lang = data.doc_lang;
    omCartWebPayParams.ref = data.doc_ref;

    //await setOmAccessTokenDocId(omCartAccessTokenParams.doc_id);
    console.log("Cart::getOmTokenFromSanity::AFTER call to fetch /api/om-sanity api :: "+omCartWebPayParams.doc_id);
    return data;
  }

  //*************************************** */
  // Name: updateOmTokenToSanity
  // Role: calls sanity api for update
  // Params: docId - OM auth bearer; newToken amount: omCartAccessTokenParams.access_token
  //*************************************** */
  //const updateOmTokenToSanity = async (docId, newToken) => {
  const updateOmTokenToSanity = async () => {

    if(omCartAccessTokenParams.doc_id == "CartInvalidDocId" || 
       omCartAccessTokenParams.access_token == "CartInvalidAccessToken") {
       console.log("Cart::updateOmTokenToSanity:: AccessToken DocId is invalid::!!! ");
       return "InvalidSanityDocId";
    }

    const params = {
      opcode: "UPD_ACCESS_TOKEN",
      doc_id: `${omCartAccessTokenParams.doc_id}`,      
      access_token: `${omCartAccessTokenParams.access_token}`
    };

    const resp = await fetch('/api/om-sanity', {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',        
      },
      body: JSON.stringify(params),
    });

    if(resp.statusCode === 500) return;
  
    const token_data = await resp.json();      
    console.log(token_data);
    console.log("Cart::updateOmTokenToSanity::AFTER call to update /api/om-sanity PUT api :: "+token_data.api_message);
    return token_data.api_message;
  }

  //*************************************** */
  // Name: handleOmWebpay
  // Role: calls web pay api
  // Params: bearer - OM auth bearer payment_url
  //*************************************** */
  const createOmPayRecToSanity = async (doc) => {
      const params = {
        opcode: "POST_WEBPAY_RECORD",     
        status: `${doc.status}`,
        message: `${doc.message}`,
        pay_token: `${doc.pay_token}`,
        payment_url: `${doc.payment_url}`,
        notif_token: `${doc.notif_token}`,
        order_id: "WEBPAY_ORDERID"
      };

      console.log("Cart::createOmPayRecToSanity::B4 call to /api/om-sanity PUT api with params below:");
      console.log(params);

      const resp = await fetch('/api/om-sanity', {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',        
        },
        body: JSON.stringify(params),
      });
  
      if(resp.statusCode === 500) return;
    
      const ret_data = await resp.json();      
      console.log(ret_data);
      console.log("Cart::createOmPayRecToSanity::AFTER call to create webpay Rec /api/om-sanity PUT api");
      return ret_data;
  }

  //*************************************** */
  // Name: handleOmWebpay
  // Role: calls web pay api
  // Params: bearer - OM auth bearer payment_url
  //*************************************** */
  const handleOmWebpayNotif = async (_token) => {
  //const handleOmWebpayNotif = async () => {
    console.log("Cart::handleOmWebpayNotif::B4 call to fetch /api/om-notification api with params below::");
    
    const params = { 
      status: "SUCCESS",    
      notif_token: `${_token}`,
      //notif_token: "MP150709.1341.A001567",
      txnid: "MP150709.1341.A00156"
    };

    console.log(params);
    const res = await fetch('/api/om-notification', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',        
      },
      body: JSON.stringify(params),
    });

    if(res.statusCode === 500) return;
    
    const data = await res.json();
    console.log("Cart::handleOmWebpayNotif::AFTER call to fetch /api/om-notification api");
    console.log(data);
    return data;
  }
  
  //*************************************** */
  // Name: handleOmWebpay
  // Role: calls web pay api
  // Params: bearer - OM auth bearer payment_url
  //*************************************** */
  const handleOmWebpay = async (bearer) => {
    console.log("Cart::handleOmWebpay::B4 call to fetch /api/om-webpay api with params below::");
    
    const params = {
      auth_bearer: `${bearer}`,
      payment_url: `${omCartWebPayParams.payment_url}`,
      merchant_key: `${omCartWebPayParams.merchant_key}`,
      currency: `${omCartWebPayParams.currency}`,  
      order_id: `${orderIdSeq}`,    
      amount: `${totalPrice}`,
      return_url: `${omCartWebPayParams.return_url}`,
      cancel_url: `${omCartWebPayParams.cancel_url}`,
      notif_url: `${omCartWebPayParams.notif_url}`,
      lang: `${omCartWebPayParams.lang}`,
      reference: `${omCartWebPayParams.ref}`
    };

    console.log(params);
    
    const res_webpay = await fetch('/api/om-webpay', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',        
      },
      body: JSON.stringify(params),
    });

    if(res_webpay.statusCode === 500) return;
    
    const data = await res_webpay.json();
    console.log("Cart::handleOmWebpay::AFTER call to fetch /api/om-webpay api");
    console.log(data);
    return data;
  }

  const handleCheckout = async () => {
    const stripe = await getStripe();

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',        
      },
      body: JSON.stringify(cartItems),
    });

    if(response.statusCode === 500) return;
    
    const data = await response.json();

    toast.loading('Redirecting...');

    stripe.redirectToCheckout({ sessionId: data.id });
  }

  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}>
            <AiOutlineLeft />
            <span className="heading">Your Cart contains</span>
            <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cartItems.length >= 1 && cartItems.map((item) => (
            <div className="product" key={item._id}>
              <img src={urlFor(item?.image[0])} className="cart-product-image" />
              <div className="item-desc">
                <div className="flex top">
                  <h5>{item.name}</h5>
                  <h4>${item.price}</h4>
                </div>
                <div className="flex bottom">
                  <div>
                  <p className="quantity-desc">
                    <span className="minus" onClick={() => toggleCartItemQuanitity(item._id, 'dec') }>
                    <AiOutlineMinus />
                    </span>
                    <span className="num" onClick="">{item.quantity}</span>
                    <span className="plus" onClick={() => toggleCartItemQuanitity(item._id, 'inc') }>
                    <AiOutlinePlus /></span>
                  </p>
                  </div>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => onRemove(item)}>
                       <TiDeleteOutline />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              <button type="button" className="btn" onClick={handleCheckout}>
                Pay with Stripe
              </button>             
              <button type="button" className="btn" onClick={handleMomoApi}>
                Pay with Mobile Money
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart