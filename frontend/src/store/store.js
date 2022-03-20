import create from "zustand";
const useStore = create((set) => ({
    contextPath: '/WAM',
    footerMsgLeft: '공무원연금공단 워크플로우',
    footerMsgRight: 'Copyright © RaonSecure.',
}));

export default useStore;
