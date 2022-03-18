import React from 'react'
import 'antd/dist/antd.css';
import {Spin} from 'antd';


const SSOCheck = () => {
    return (
        <div className="token-checking">
            Token Verification..
            <Spin/>
        </div>
    )
};

export default SSOCheck;
