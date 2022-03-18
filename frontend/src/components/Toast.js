import React from "react";
import {CToast, CToastBody, CToastClose,} from '@coreui/react'

const Toast = (props) => {

  return (
    <CToast
      autohide={false}
      visible={props.visible}
      color={props.bgColor}
      className="text-white align-items-center"
      onShow={function () {
        setTimeout(function () {
          props.visibleFunc(false)
        }, 2000)
      }}
    >
      <div className="d-flex">
        <CToastBody>{props.msg}</CToastBody>
        <CToastClose className="me-2 m-auto" white onClick={() => props.visibleFunc(false)}/>
      </div>
    </CToast>
  )
};

export default Toast;