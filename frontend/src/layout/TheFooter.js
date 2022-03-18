import React from 'react'
import { CFooter } from '@coreui/react'

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
        <span className="ml-1">공무원연금공단 워크플로우</span>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">Copyright © RaonSecure.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter);
