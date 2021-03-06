import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CRow,} from '@coreui/react'
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {SearchOutlined, SmileOutlined, UserOutlined,} from '@ant-design/icons';
import {Button, message, Popconfirm, Radio, Space} from "antd";
import * as common from "../../components/CommonFunction";

let getDataMessage;

const OrgRolesApproval = () => {
    const [clickType, setClickType] = useState(0);
    const [modalClickType, setModalClickType] = useState(0);
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

    useEffect(() => {
        if (!getDataSignal) {
            getDataMessage = message.loading('Now Loading...', 0);
        } else {
            setTimeout(getDataMessage, 300);
        }
    }, [getDataSignal]);
    useEffect(() => {
        setGetDataSignal(true);
        fn.getOrgUserTreeData();
        fn.getRoleTree();
    }, []);

    const fn = {
        visible: {
            mapping: visible => {
                setMappingVisible(visible);
            },
            mappingImpossible: visible => {
                setMappingImpossibleVisible(visible);
                if (!visible) {
                    setMappingImpossibleList(null);
                }
            },
        },
        getOrgUserTreeData: async () => {
            const data = await GetData("/REST/common/getOrgUserTreeData", {}, 'c0');

            if (data === undefined) {
                setGetDataSignal(false);
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else {
                setOrgUserTree(<TreeDataViewer data={makeOrgUserTree(data)} checkable={true} update={onCheckOrgs}
                                               setUpdate={setOnCheckOrgs}/>)
            }

            function makeOrgUserTree(array) {
                let returnData = [];
                let map = {};
                let isOpen = [];

                for (let i = 0; i < array.length; i++) {
                    let obj = {
                        key: array[i].SEPARATOR === '1' ? common.createUuid() : array[i]['ID'],
                        title: array[i]['NAME'],
                        value: array[i]['ID']
                    };

                    if ((i + 1 !== array.length && array[i + 1].SEPARATOR !== '1' && array[i].PARENT === '1') ||
                        (i + 1 !== array.length && array[i].PARENT === '1' && array[i].SEPARATOR === '0')) {
                        isOpen.push(obj.key);
                    }

                    if (array[i].SEPARATOR === '1') {
                        obj['icon'] = array[i].TARGET === '1' ? <SmileOutlined/> : <UserOutlined/>;
                        obj.title += array[i].POSITION !== null ? ` ${array[i]['POSITION']}` : '';
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
                const data = await GetData("/REST/mapping/getOrgRoleMappingData", {orgId: orgId, flag: 'a'}, 'c01');
                setSelectedOrgId(orgId);
                setMappingCheckBox({});
                setGetDataSignal(false);

                if (data === undefined) {
                    setGetDataSignal(true);
                    message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    return false;
                } else if (data.length === 0 || data === '') {
                    setGetDataSignal(true);
                    message.warning('????????? ???????????? ????????????', 2);
                    return false;
                } else {
                    setMappingTree(<TreeDataViewer data={makeMappingRoleTree(data)} checkable={true}
                                                   update={mappingCheckBox}
                                                   setUpdate={setMappingCheckBox}/>);
                    fn.visible.mapping(true);
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
                        if (array[i].FLAG === 'a') {
                            isChecked.push(obj.key);
                            fn.onMappingCheckBox({target: {name: obj.key, checked: true}});
                        } else {
                            obj.title += ' (Default)';
                            obj['disableCheckbox'] = true;
                        }
                    } else {
                        fn.onMappingCheckBox({target: {name: obj.key, checked: false}});
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
        },
        getRoleTree: async () => {
            const data = await GetData("/REST/common/getRoleTreeData", {}, '', 'auto');

            if (data === undefined) {
                setGetDataSignal(false);
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else {
                setRoleServiceTree(<TreeDataViewer data={makeRoleServiceTree(data)} checkable={true}
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

                    if (parseInt(array[i].LEAF) === 0) {
                        obj['disableCheckbox'] = true;
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
        },
        setData: () => {
            let selectedOrgs = [];
            let selectedRoles = [];

            for (const key in onCheckOrgs) {
                if (onCheckOrgs[key]) selectedOrgs.push(key);
            }

            for (const key in onCheckRoles) {
                if (onCheckRoles[key]) selectedRoles.push(key);
            }

            if (selectedOrgs.length === 0 || selectedRoles.length === 0) {
                message.warning('????????? ?????? ?????? ????????? ????????????', 2);
                return;
            }

            const obj = {
                orgs: selectedOrgs,
                roles: selectedRoles,
                action: 'upsert',
                flag: 'a'
            };

            fn.updateOrgRoleMapping(obj);
        },
        updateOrgRoleMapping: obj => {
            setDataUpdating(true);
            setDataUpdatingModal(true);
            GetData('/REST/mapping/orgRoleMappingImpossibleCheck', obj, '', 'auto')
                .then((data) => {
                    if (data.length > 0) {
                        setMappingImpossibleVisible(true);
                        setMappingImpossibleList(
                            <>
                                <div style={{fontWeight: 'bold', fontSize: '17px'}}>{`??????&??????(??????) ??? ??????????????????`}</div>
                                <br/>
                                {data.map((o) => {
                                    return <>{`[${o.ORG_NAME}] ?????? [${o.ROLE_NAME}] ??????`}<br/></>;
                                })}
                            </>
                        );

                        setDataUpdating(false)
                        setDataUpdatingModal(false)
                    } else {
                        SetData('/REST/mapping/updateOrgRoleMapping', obj, 'c1', 2)
                            .then((data) => {
                                if (data) {
                                    message.success('?????????????????????', 2);
                                } else {
                                    message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                                }
                            }).finally(() => {
                            setDataUpdating(false)
                            setDataUpdatingModal(false)
                        });
                    }
                });
        },
        onMappingCheckBox: e => {
            const nextInputs = mappingCheckBox;
            nextInputs[e.target.name] = e.target.checked;
            setMappingCheckBox(nextInputs);
        }
    };

    const modalButtons = {
        mappingUpdate: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.mapping(false)
                }}>??????
                </Button>
                <Popconfirm
                    title="?????????????????????????"
                    onConfirm={() => {
                        let selectedRoles = [];

                        for (const key in mappingCheckBox) {
                            if (mappingCheckBox[key]) selectedRoles.push(key);
                        }

                        const obj = {
                            orgs: [selectedOrgId],
                            roles: selectedRoles,
                            action: 'delete',
                            flag: 'a'
                        };

                        fn.updateOrgRoleMapping(obj);
                    }}
                    okText="???"
                    cancelText="?????????"
                >
                    <Button type="primary" loading={dataUpdatingModal}>??????</Button>
                </Popconfirm>
            </div>
        )
    }

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>??????/?????? ??????</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Radio.Group value={clickType} onChange={e => setClickType(e.target.value)}>
                                        <Space direction="vertical">
                                            <Radio value={0}>?????? ??????</Radio>
                                            <Radio value={1}>?????????????????? ??????</Radio>
                                        </Space>
                                    </Radio.Group>
                                    <Popconfirm
                                        title="?????????????????????????"
                                        onConfirm={fn.setData}
                                        okText="???"
                                        cancelText="?????????"
                                    >
                                        <Button type="primary" loading={dataUpdating}>??????</Button>
                                    </Popconfirm>
                                </CCol>
                            </CRow>

                            <CRow className="g-3" onMouseOver={e => {
                                if (clickType === 1 && e.target.classList.contains('ant-tree-checkbox-inner')) {
                                    e.target.click();
                                }
                            }}>
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
                visibleFunc={fn.visible.mapping}
                title='????????? ??????'
                buttons={modalButtons.mappingUpdate}
                content={<>
                    <Radio.Group value={modalClickType}
                                 onChange={e => setModalClickType(e.target.value)}>
                        <Space direction="vertical">
                            <Radio value={0}>?????? ??????</Radio>
                            <Radio value={1}>?????????????????? ??????</Radio>
                        </Space>
                    </Radio.Group>
                    <div onMouseOver={e => {
                        if (modalClickType === 1 && e.target.classList.contains('ant-tree-checkbox-inner')) {
                            e.target.click();
                        }
                    }}>
                        {mappingTree}
                    </div>
                </>}
            />

            <Modal
                visible={mappingImpossibleVisible}
                visibleFunc={fn.visible.mappingImpossible}
                title='?????? ??????'
                content={mappingImpossibleList}
            />
        </>
    )
};

export default OrgRolesApproval;