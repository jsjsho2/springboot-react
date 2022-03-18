import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CLabel, CRow,} from '@coreui/react'
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {SearchOutlined, SmileOutlined, UserOutlined,} from '@ant-design/icons';
import {Button, message, Popconfirm, Radio} from "antd";

let getDataMessage;

const OrgRoles = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [dataUpdating, setDataUpdating] = useState(false);
    const [dataUpdatingModal, setDataUpdatingModal] = useState(false);

    const [mappingVisible, setMappingVisible] = useState(false);
    const [mappingImpossibleVisible, setMappingImpossibleVisible] = useState(false);
    const [mappingImpossibleList, setMappingImpossibleList] = useState(null);

    const [orgUserTree, setOrgUserTree] = useState(null);
    const [roleServiceTree, setRoleServiceTree] = useState(null);
    const [mappingTree, setMappingTree] = useState(null);

    const [onCheckOrgs, setOnCheckOrgs] = useState({});
    const [onCheckRoles, setOnCheckRole] = useState({});
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [mappingCheckBox, setMappingCheckBox] = useState({});

    const onMappingCheckBox = e => {
        const nextInputs = mappingCheckBox;
        nextInputs[e.target.name] = e.target.checked;
        setMappingCheckBox(nextInputs)
    };

    async function getOrgUserTreeData() {
        const data = await GetData("/REST/common/getOrgUserTreeData", {}, 'c2');

        if (data === undefined) {
            setGetDataSignal(false);
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else {
            setOrgUserTree(<TreeDataViewer data={makeOrgUserTree(data)}
                                           checkable={true}
                                           update={onCheckOrgs}
                                           setUpdate={setOnCheckOrgs}/>)
        }

        function makeOrgUserTree(array) {
            let returnData = [];
            let map = {};
            let isOpen = [];

            for (let i = 0; i < array.length; i++) {
                let obj = {key: array[i]['ID'], title: array[i]['NAME'], value: array[i]['ID']};

                if ((i + 1 !== array.length && array[i + 1].SEPARATOR !== '1' && array[i].PARENT === '1') ||
                    (i + 1 !== array.length && array[i].PARENT === '1' && array[i].SEPARATOR === '0')) {
                    isOpen.push(obj.key);
                }

                if (array[i].SEPARATOR === '1') {
                    if (array[i].TARGET === '1') {
                        obj.title += '(본인)';
                        obj['icon'] = <SmileOutlined/>;
                    } else {
                        obj.title += `(${array[i]['ID']})`;
                        obj['icon'] = <UserOutlined/>;
                    }
                    obj['disableCheckbox'] = true;
                } else {
                    obj.title = <>
                        {obj.title}
                        <button className='treeview-search' onClick={function (e) {
                            getOrgRoleMappingData(e, array[i]['ID']);
                            e.stopPropagation();
                        }}><SearchOutlined/></button>
                    </>;
                    obj['children'] = [];
                }

                map[obj.key] = obj;

                const parent = array[i]['PARENT_ID'] || '-1';

                if (!map[parent]) {
                    map[parent] = {
                        children: []
                    };
                }

                map[parent].children.push(obj);
            }

            returnData[0] = map['-1'].children;
            returnData[1] = isOpen;
            returnData[2] = [];
            return returnData;
        }

        const getOrgRoleMappingData = async (e, orgId) => {
            const data = await GetData("/REST/mapping/getOrgRoleMappingData", {orgId: orgId, flag: 'd'}, 'c21');
            setSelectedOrgId(orgId);
            setMappingCheckBox({});
            setGetDataSignal(false);

            if (data === undefined) {
                setGetDataSignal(true);
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                setGetDataSignal(true);
                message.warning('매핑된 서비스가 없습니다', 2);
                return false;
            } else {
                setMappingTree(<TreeDataViewer data={makeMappingRoleTree(data)} checkable={true}
                                               update={mappingCheckBox}
                                               setUpdate={setMappingCheckBox}/>);
                mappingVisibleFunc(true);
            }

            setGetDataSignal(true);
        };

        const makeMappingRoleTree = (array) => {
            let returnData = [];
            let map = {};
            let isOpen = [];
            let isChecked = [];

            for (let i = 0; i < array.length; i++) {
                let obj = {key: array[i].ID, title: array[i].NAME, value: array[i]['ID']};

                if (array[i].PARENT === '1') {
                    isOpen.push(obj.key);
                }

                if (array[i].TARGET === '1') {
                    if (array[i].FLAG === 'd') {
                        isChecked.push(obj.key);
                        onMappingCheckBox({target: {name: obj.key, checked: true}});
                    } else {
                        obj.title += ' (결재)';
                        obj['disableCheckbox'] = true;
                    }
                } else {
                    onMappingCheckBox({target: {name: obj.key, checked: false}});
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
            }

            returnData[0] = map['null'].children;
            returnData[1] = isOpen;
            returnData[2] = isChecked;
            return returnData;
        };
    }

    async function getRoleTree() {
        const data = await GetData("/REST/common/getRoleTreeData", {}, '', 'auto');

        if (data === undefined) {
            setGetDataSignal(false);
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else {
            setRoleServiceTree(<TreeDataViewer data={makeRoleServiceTree(data)}
                                               checkable={true}
                                               update={onCheckRoles}
                                               setUpdate={setOnCheckRole}/>);
        }

        function makeRoleServiceTree(array) {
            let returnData = [];
            let map = {};
            let isOpen = [];

            for (let i = 0; i < array.length; i++) {
                let obj = {key: array[i]['ID'], value: array[i]['ID']};

                if (i === 0) {
                    isOpen.push(obj.key);
                }

                obj['title'] = array[i]['NAME'];

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
            }

            returnData[0] = map['null'].children;
            returnData[1] = isOpen;
            returnData[2] = [];
            return returnData;
        }
    }

    useEffect(() => {
        if (!getDataSignal) {
            getDataMessage = message.loading('Now Loading...', 0);
        } else {
            setTimeout(getDataMessage, 300);
        }
    }, [getDataSignal]);
    useEffect(() => {
        setGetDataSignal(true);
        getOrgUserTreeData();
        getRoleTree();
    }, []);

    function mappingVisibleFunc(visible) {
        setMappingVisible(visible);
    }

    function mappingImpossibleVisibleFunc(visible) {
        setMappingImpossibleVisible(visible);
        if (!visible) {
            setMappingImpossibleList(null);
        }
    }

    const setData = () => {
        let selectedOrgs = [];
        let selectedRoles = [];

        for (const key in onCheckOrgs) {
            if (onCheckOrgs[key]) selectedOrgs.push(key);
        }

        for (const key in onCheckRoles) {
            if (onCheckRoles[key]) selectedRoles.push(key);
        }

        if (selectedOrgs.length === 0 || selectedRoles.length === 0) {
            message.warning('선택된 조직 또는 역할이 없습니다', 2);
            return;
        }

        const obj = {
            orgs: selectedOrgs,
            roles: selectedRoles,
            action: 'upsert',
            flag: 'd'
        };

        updateOrgRoleMapping(obj);
    };

    const updateOrgRoleMapping = (obj) => {
        setDataUpdating(true);
        setDataUpdatingModal(true);
        GetData('/REST/mapping/OrgRoleMappingImpossibleCheck', obj, '', 'auto')
            .then((data) => {
                if (data.length > 0) {
                    setMappingImpossibleVisible(true);
                    setMappingImpossibleList(
                        <>
                            <div style={{fontWeight: 'bold', fontSize: '17px'}}>{`조직&역할(결재) 에 설정되어있음`}</div>
                            <br/>
                            {data.map((o) => {
                                return <>{`[${o.ORG_NAME}] 조직 [${o.ROLE_NAME}] 역할`}<br/></>;
                            })}
                        </>
                    );

                    setDataUpdating(false)
                    setDataUpdatingModal(false)
                } else {
                    SetData('/REST/mapping/updateOrgRoleMapping', obj, 'c1', 2)
                        .then((data) => {
                            if (data) {
                                message.success('저장되었습니다', 2);
                            } else {
                                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                            }
                        }).finally(() => {
                        setDataUpdating(false)
                        setDataUpdatingModal(false)
                    });
                }
            });
    };

    const mappingUpdateButtons = (
        <div key={'buttons'}>
            <Button onClick={() => {
                mappingVisibleFunc(false)
            }}>닫기
            </Button>
            <Popconfirm
                title="저장하시겠습니까?"
                onConfirm={() => {
                    let selectedRoles = [];

                    for (const key in mappingCheckBox) {
                        if (mappingCheckBox[key]) selectedRoles.push(key);
                    }

                    const obj = {
                        orgs: [selectedOrgId],
                        roles: selectedRoles,
                        action: 'delete',
                        flag: 'd'
                    };

                    updateOrgRoleMapping(obj);
                }}
                okText="예"
                cancelText="아니오"
            >
                <Button type="primary" loading={dataUpdatingModal}>저장</Button>
            </Popconfirm>
        </div>
    );

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>조직/역할 매핑</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Popconfirm
                                        title="저장하시겠습니까?"
                                        onConfirm={setData}
                                        okText="예"
                                        cancelText="아니오"
                                    >
                                        <Button type="primary" loading={dataUpdating}>저장</Button>
                                    </Popconfirm>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <CCol sm={6}>
                                    {orgUserTree}
                                </CCol>

                                <CCol sm={6}>
                                    {roleServiceTree}
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={mappingVisible}
                visibleFunc={mappingVisibleFunc}
                title='매핑된 역할'
                buttons={mappingUpdateButtons}
                content={mappingTree}
            />

            <Modal
                visible={mappingImpossibleVisible}
                visibleFunc={mappingImpossibleVisibleFunc}
                title='매핑 불가'
                content={mappingImpossibleList}
            />
        </>
    )
};

export default OrgRoles;