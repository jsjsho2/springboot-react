import React from "react";
import {CButton} from '@coreui/react'
import CIcon from '@coreui/icons-react';

const CustomButton = (props) => {

  return (
    <>
      <CButton className='btn btn-info grid-in-buttons'
               onClick={() => {
                 props.hasOwnProperty('event') && props.event(props.data);
               }}
      ><CIcon name={props.icon}/></CButton>
    </>
  )
};

export default CustomButton;