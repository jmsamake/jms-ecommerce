import React from 'react';
import { AiFillInstagram, AiFillYoutube, AiOutlineTwitter} from 'react-icons/ai';

const Footer = () => {
  return (
    <div className="footer-container">
      <p>2024 JMS Headphones All rights reserverd</p>
      <p className="icons">
        <AiFillInstagram />
        <AiOutlineTwitter />
        <AiFillYoutube />
      </p>
    </div>
  )
}

export default Footer