import React from 'react'
import {CFooter} from '@coreui/react'
import useStore from "../store/store";

const TheFooter = () => {

    const {footerMsgLeft, footerMsgRight} = useStore();

    return (
        <CFooter fixed={false}>
            <div>
                <span className="ml-1">{footerMsgLeft}</span>
            </div>
            <div className="mfs-auto">
                <span className="mr-1">{footerMsgRight}</span>
            </div>
        </CFooter>
    )
};

export default React.memo(TheFooter);
