import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CRow,} from '@coreui/react'
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {FileTextOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, message, Popconfirm, Radio, Space} from "antd";

const RoleService = () => {
    const [requestUpdate, setRequestUpdate] = useState(false);
    const [clickType, setClickType] = useState(0);

    const [mappingVisible, setMappingVisible] = useState(false);
    const [requestVisible, setRequestVisible] = useState(false);

    const [serviceTree, setServcieTree] = useState(null);
    const [roleTree, setRoleTree] = useState(null);
    const [mappingTree, setMappingTree] = useState(null);

    const [onCheckService, setOnCheckService] = useState({});
    const [onCheckRoles, setOnCheckRole] = useState({});

    const [inputs, setInputs] = useState({
        rsn: '',
        presetName: '',
    });
    const onChange = (e) => {
        const {name, value} = e.target;

        const nextInputs = {
            ...inputs,
            [name]: value,
        };
        setInputs(nextInputs)
    };

    useEffect(() => {
        fn.getServiceTree();
        fn.getRoleTree();
    }, []);

    const fn = {
        visible: {
            mapping: visible => {
                setMappingVisible(visible);
            },
            request: visible => {
                setRequestVisible(visible);
            }
        },
        getServiceTree: async () => {
            const data = await GetData("/REST/common/getServiceTreeData", {}, 'c1');

            if (data === undefined) {
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else {
                setServcieTree(<TreeDataViewer data={makeServiceTree(data)} checkable={true} update={onCheckService}
                                               setUpdate={setOnCheckService}/>);
            }

            function makeServiceTree(array) {
                let returnData = [];
                let map = {};
                let isOpen = [];

                for (let i = 0; i < array.length; i++) {
                    let obj = {key: array[i]['ID'], title: array[i]['NAME']};

                    if (i === 0) {
                        isOpen.push(obj.key);
                    }

                    if (array[i].TYPE === '0') {
                        obj['disableCheckbox'] = true;
                        obj['children'] = []
                    }

                    map[obj.key] = obj;

                    const parent = array[i]['PARENT_ID'] || 'null';

                    if (!map[parent]) {
                        map[parent] = {
                            children: []
                        };
                    }

                    try {
                        map[parent].children.push(obj);
                    } catch {
                        map[parent]['children'] = [];
                        map[parent].children.push(obj);
                    }
                }

                returnData[0] = map['null'].children;
                returnData[1] = isOpen;
                returnData[2] = [];
                return returnData;
            }
        },
        getRoleTree: async () => {
            const data = await GetData("/REST/common/getRoleTreeData", {}, '', 'auto');

            if (data === undefined) {
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else {
                setRoleTree(<TreeDataViewer data={makeRoleTree(data)} checkable={true} update={onCheckRoles}
                                            setUpdate={setOnCheckRole}/>);
            }

            function makeRoleTree(array) {
                let returnData = [];
                let map = {};
                let isOpen = [];

                for (let i = 0; i < array.length; i++) {
                    let obj = {key: array[i]['ID']};

                    if (i === 0) {
                        isOpen.push(obj.key);
                    }

                    if (array[i].PARENT_ID === null) {
                        obj['children'] = []
                    }

                    obj['title'] = <>
                        {array[i]['NAME']}
                        <button className='treeview-search' onClick={function (e) {
                            getRoleServiceMappingData(e, array[i]['ID']);
                            e.stopPropagation();
                        }}><SearchOutlined/></button>
                    </>;

                    map[obj.key] = obj;

                    const parent = array[i]['PARENT_ID'] || 'null';

                    if (!map[parent]) {
                        map[parent] = {
                            children: []
                        };
                    }

                    try {
                        map[parent].children.push(obj);
                    } catch {
                        map[parent]['children'] = [];
                        map[parent].children.push(obj);
                    }
                }

                returnData[0] = map['null'].children;
                returnData[1] = isOpen;
                returnData[2] = [];
                return returnData;
            }

            const getRoleServiceMappingData = async (e, roleId) => {
                const data = await GetData("/REST/authority/getRoleInService", {roleId: roleId}, 'c11');

                if (data === undefined) {
                    message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    return false;
                } else if (data.length === 0 || data === '') {
                    message.warning('매핑된 서비스가 없습니다', 2);
                    return false;
                } else {
                    setMappingTree(<TreeDataViewer data={makeMappingRoleTree(data)}/>);
                    fn.visible.mapping(true);
                }
            };

            const makeMappingRoleTree = (array) => {
                let returnData = [];
                let map = {};
                let isOpen = [];

                for (let i = 0; i < array.length; i++) {
                    let obj = {key: array[i]['ID'], title: array[i]['NAME'], type: array[i]['TYPE']};

                    if (obj.type === '1' || obj.type === 1) {
                        obj['icon'] = <FileTextOutlined/>;
                    } else {
                        obj['children'] = [];
                        isOpen.push(obj.key);
                    }

                    if (array[i].PARENT_ID === null) {
                        obj['children'] = []
                    }

                    map[obj.key] = obj;

                    const parent = array[i]['PARENT_ID'] || 'null';

                    if (!map[parent]) {
                        map[parent] = {
                            children: []
                        };
                    }

                    try {
                        map[parent].children.push(obj);
                    } catch {
                        map[parent]['children'] = [];
                        map[parent].children.push(obj);
                    }

                    map[parent].children = map[parent].children.sort(function (a, b) {
                        return a.type - b.type;
                    });
                }

                returnData[0] = map['null'].children;
                returnData[1] = isOpen;
                returnData[2] = [];
                return returnData;
            };
        },
        request: () => {
            let selectedRoles = [];
            let selectedServices = [];

            for (const key in onCheckRoles) {
                if (onCheckRoles[key]) selectedRoles.push(key);
            }

            for (const key in onCheckService) {
                if (onCheckService[key]) selectedServices.push(key);
            }

            if (selectedServices.length === 0 || selectedRoles.length === 0) {
                message.warning('선택된 역할 또는 서비스가 없습니다', 2);
                return;
            }

            setRequestVisible(true);
        },
        requestInit: () => {
            if (inputs.rsn.length === 0) {
                message.warning('사유를 입력하세요', 2);
                return false;
            } else {
                let flow = [];

                const obj = {
                    id: '관리자',
                    name: '관리자',
                    status: '0',
                    date: '',
                    rsn: ''
                };

                flow.push(obj);

                let selectedRoles = [];
                let selectedServices = [];
                let services = '';

                for (const key in onCheckRoles) {
                    if (onCheckRoles[key]) selectedRoles.push(key);
                }

                for (const key in onCheckService) {
                    if (onCheckService[key]) selectedServices.push(key);
                }

                for (let i = 0; i < selectedServices.length; i++) {
                    services += (services === '' ? '' : ',') + selectedServices[i];
                }

                const approvalObj = {
                    summary: services,
                    requestInfo: [selectedRoles, selectedServices],
                    rsn: inputs.rsn,
                    targetId: flow[0].id,
                    status: '0',
                    flow: flow,
                    type: 1
                };

                SetData("/REST/approval/addApproval", approvalObj, 'c1', 5)
                    .then((data) => {
                        if (data) {
                            message.success('결재요청 완료', 2);
                            setRequestVisible(false);
                        } else {
                            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                        }
                    }).finally(() => setRequestUpdate(false));
            }
        },
    };

    const modalButtons = {
        request: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.request(false)
                }}>닫기
                </Button>
                <Popconfirm
                    title="결재를 요청하시겠습니까?"
                    onConfirm={fn.requestInit}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={requestUpdate}>결재요청</Button>
                </Popconfirm>
            </div>
        )
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>역할/서비스 매핑</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Radio.Group value={clickType} onChange={e => setClickType(e.target.value)}>
                                        <Space direction="vertical">
                                            <Radio value={0}>직접 체크</Radio>
                                            <Radio value={1}>마우스오버시 체크</Radio>
                                        </Space>
                                    </Radio.Group>
                                    <Button type="primary" onClick={fn.request}>결재요청</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3" onMouseOver={e => {
                                if (clickType === 1 && e.target.classList.contains('ant-tree-checkbox-inner')) {
                                    e.target.click();
                                }
                            }}>
                                <CCol sm={6}>
                                    {roleTree}
                                </CCol>

                                <CCol sm={6}>
                                    {serviceTree}
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={mappingVisible}
                visibleFunc={fn.visible.mapping}
                title='매핑된 역할'
                buttons={<Button onClick={() => {
                    fn.visible.mapping(false)
                }}>닫기
                </Button>}
                content={mappingTree}
            />

            <Modal
                visible={requestVisible}
                visibleFunc={fn.visible.request}
                title='결재요청 사유를 입력하세요'
                buttons={modalButtons.request}
                content={
                    <>
                        개발자 - 관리자에게 결재요청을 보냅니다<br/>
                        관리자 - 해당 내용은 바로 적용됩니다<br/><br/>
                        <textarea
                            rows='5'
                            style={{width: '100%'}}
                            name='rsn'
                            onChange={onChange}
                        />
                    </>
                }
            />
        </>
    )
};

export default RoleService;