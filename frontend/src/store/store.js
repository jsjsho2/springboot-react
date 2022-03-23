import create from "zustand";

const useStore = create((set) => ({
    contextPath: '/WAM',
    sessionTime: 1200,
    headerNameAndTitle: '',
    footerMsgLeft: '',
    footerMsgRight: '',
    gridRowStack: 10,
    gridHeight: 7,
    batchPath: '',
    redirectUrl: '',
    updateConfig: (data) => {
        switch (data.KEY) {
            case 'contextPath' :
                return set(() => ({contextPath: data.VALUE}))
                break;
            case 'sessionTime' :
                return set(() => ({sessionTime: data.VALUE}))
                break;
            case 'headerNameAndTitle' :
                return set(() => ({headerNameAndTitle: data.VALUE}))
                break;
            case 'footerMsgRight' :
                return set(() => ({footerMsgRight: data.VALUE}))
                break;
            case 'footerMsgLeft' :
                return set(() => ({footerMsgLeft: data.VALUE}))
                break;
            case 'gridRowStack' :
                return set(() => ({gridRowStack: parseInt(data.VALUE)}))
                break;
            case 'gridHeight' :
                return set(() => ({gridHeight: parseInt(data.VALUE)}))
                break;
            case 'batchPath' :
                return set(() => ({batchPath: data.VALUE}))
                break;
            case 'redirectUrl' :
                return set(() => ({redirectUrl: data.VALUE}))
                break;
            default:
                break;
        }
    }
}));

export default useStore;
