import React from 'react';

const Card = ({ url, title }) => {
    return <div className="card">
        <p className="url"><b><a href={url} style={{color:"black", textDecoration:"none"}}>{url}</a></b></p>
        <p className="title">{title}</p>
    </div>
}
export default Card;