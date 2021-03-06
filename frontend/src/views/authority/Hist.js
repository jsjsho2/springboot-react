import React, {useEffect, useRef, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CRow, CSelect,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import {Button, Dropdown, Menu, message, Tag} from "antd";
import {DownloadOutlined, FileTextOutlined} from '@ant-design/icons';
import axios from "axios";
import TreeDataViewer from "../../components/TreeDataViewer";
import CustomButton from "../../components/CustomButton";

const userAuth = localStorage.getItem(`userAuth`);
const contextPath = '/WAM';

const Hist = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [loadings, setLoadings] = useState(true);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [histList, setHistList] = useState([]);
    const [roleServiceData, setRoleServiceData] = useState([]);

    const btnRef = useRef(null);

    const [inputs, setInputs] = useState({
        roleName: '',
        targetInfo: '',
        searchType: 'name',
        userAuth: userAuth,
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
        if (!getDataSignal) {
            common.showGridLoadingMsg();
        } else {
            common.hideGridLoadingMsg();
        }
    }, [getDataSignal]);
    useEffect(() => {
        fn.getData();
    }, []);

    const fn = {
        visible: {
            preview: visible => {
                setPreviewVisible(visible);
            },
        },
        getData: async () => {
            setGetDataSignal(false);
            setLoadings(true);

            const data = await GetData(`/REST/authority/getUserAuthorityHist`, inputs, 'a2');

            setGetDataSignal(true);
            setLoadings(false);

            let returnData = [];
            let rowSpanCheck = 1;

            if (data === undefined) {
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();
                let obj = {};

                for (let i = 0; i < data.length; i++) {
                    obj = {
                        targetUuid: data[i].TARGET_UUID,
                        lastModifyDate: common.numberDateToString(data[i].LAST_MODIFY_DATE),
                        rowSpan: 1,
                        targetInfo: `${data[i].NAME}(${data[i].USER_ID})`
                    };

                    const roleId = data[i].ROLE_ID;
                    const roleName = data[i].ROLE_NAME;
                    const from = common.numberDateToString(data[i].FROM_DATE);
                    const to = common.numberDateToString(data[i].TO_DATE);
                    const status = parseInt(data[i].STATUS);

                    if (i + 1 !== data.length) {
                        if (data[i].TARGET_UUID !== data[i + 1].TARGET_UUID || data[i].UUID.length === 32) {
                            fillObject(obj, roleId, roleName, from, to, status);
                            setRowSpan(i);
                        } else {
                            fillObject(obj, roleId, roleName, from, to, status);
                            rowSpanCheck++;
                        }
                    } else {
                        fillObject(obj, roleId, roleName, from, to, status);
                        setRowSpan(i);
                    }

                    returnData.push(obj);
                }
            }

            function setRowSpan(i) {
                if (rowSpanCheck !== 1) {
                    const idx = (i + 1) - rowSpanCheck;
                    returnData[idx].rowSpan = rowSpanCheck;
                    rowSpanCheck = 1;
                }
            }

            function fillObject(obj, roleId, roleName, from, to, status) {
                obj['roleId'] = roleId;
                obj['roleName'] = roleName;
                obj['from'] = from;
                obj['to'] = to;
                obj['status'] = status;
            }

            setHistList(returnData);
        },
        excelMenus: (
            <Menu>
                <Menu.Item key="0">
                    <a onClick={() => fn.excelDown('xlsx')}>.xlsx</a>
                </Menu.Item>
            </Menu>
        ),
        excelDown: async type => {
            axios({
                method: 'POST',
                url: `${contextPath}/excelDown`,
                responseType: 'blob',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                data: {type: type, page: 'hist', ...inputs}
            }).then(response => {
                const dateTime = new Date();
                const date = ("0" + (dateTime.getDate())).slice(-2);
                const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
                const year = dateTime.getFullYear();
                const hours = dateTime.getHours();
                const minutes = dateTime.getMinutes();

                const url = window.URL.createObjectURL(new Blob([response.data], {type: response.headers['content-type']}));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${year}${month}${date}${hours}${minutes}????????????_????????????.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
        },
        PreviewService: props => {

            const getRoleInService = async roleId => {
                const data = await GetData("/REST/authority/getRoleInService", {roleId: props.value}, 'a11');

                if (data === undefined) {
                    setPreviewVisible(false);
                    message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    return false;
                } else if (data.length === 0 || data === '') {
                    setPreviewVisible(false);
                    message.warning('????????? ???????????? ????????????', 2);
                    return false;
                } else {
                    setRoleServiceData(<TreeDataViewer data={makeTreeData(data)}/>);
                    fn.visible.preview(true);
                }

                function makeTreeData(array) {
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

                        map[obj.key] = obj;

                        let parent = array[i]['PARENT_ID'] || 'null';

                        if (!map[parent]) {
                            map[parent] = {
                                children: []
                            };
                        }

                        map[parent].children.push(obj);
                        map[parent].children = map[parent].children.sort(function (a, b) {
                            return a.type - b.type;
                        });
                    }


                    returnData[0] = map['null'].children;
                    returnData[1] = isOpen;
                    returnData[2] = [];
                    return returnData;
                }
            };

            return (
                <CustomButton
                    event={getRoleInService}
                    data={props.data.id}
                    icon={'cil-search'}
                />
            )
        },
    }

    const grid = {
        CustomColor: props => {
            let statusText;
            switch (props.value) {
                case 0:
                    statusText = <Tag color="gray">???????????????</Tag>;
                    break;
                case 1:
                    statusText = <Tag color="green">?????????</Tag>;
                    break;
                case 2:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 3:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 4:
                    statusText = <Tag color="gray">??????</Tag>;
                    break;
                case 5:
                    statusText = <Tag color="green">??????</Tag>;
                    break;
                case 6:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 7:
                    statusText = <Tag color="gray">????????????</Tag>;
                    break;
                case 8:
                    statusText = <Tag color="gray">Default</Tag>;
                    break;
                case 9:
                    statusText = <Tag color="red">????????????</Tag>;
                    break;
            }
            return (statusText);
        },
        createShowCellRenderer: () => {
            function ShowCellRenderer() {

            }

            ShowCellRenderer.prototype.init = function (params) {
                const cellBlank = !params.value;
                if (cellBlank) {
                    return null;
                }
            };
            ShowCellRenderer.prototype.getGui = function () {
                return this.ui;
            };
            return ShowCellRenderer;
        },
        colOption: userAuth === 'admin'
            ? [
                {headerName: "??????", field: "targetInfo"},
                {headerName: "?????? ?????? ??????", field: "lastModifyDate"},
                {headerName: "??????", field: "roleName"},
                {headerName: "?????? ??????", field: "from"},
                {headerName: "?????? ??????", field: "to"},
                {headerName: "??????", field: "status", cellRenderer: 'customColor'},
                {headerName: "??????", field: "id", cellRenderer: 'previewService', maxWidth: 80}
            ]
            : [
                {
                    headerName: "????????????", field: "rowSpan", rowSpan: (params) => {
                        return params.data.rowSpan;
                    },
                    cellClassRules: {'show-cell': 'true'},
                    maxWidth: 90,
                },
                {headerName: "?????? ?????? ??????", field: "lastModifyDate"},
                {headerName: "??????", field: "roleName"},
                {headerName: "?????? ??????", field: "from"},
                {headerName: "?????? ??????", field: "to"},
                {headerName: "??????", field: "status", cellRenderer: 'customColor'},
                {headerName: "??????", field: "roleId", cellRenderer: 'previewService', maxWidth: 80}
            ],
    };

    const frameworkComponents = {
        customColor: grid.CustomColor,
        previewService: fn.PreviewService,
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>?????? ?????? ??????</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3" onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    btnRef.current.dispatchEvent(new Event('click', {bubbles: true}));
                                }
                            }}>
                                {
                                    userAuth === `admin` &&
                                    <>
                                        <CCol sm={2}>
                                            <CLabel>??????</CLabel>
                                            <CSelect name='searchType' className='ant-input' onChange={onChange}>
                                                <option value="name">??????</option>
                                                <option value="id">ID</option>
                                            </CSelect>
                                        </CCol>

                                        <CCol sm={2}>
                                            <CLabel>?????? ??????</CLabel>
                                            <CInput
                                                name="targetInfo"
                                                onChange={onChange}
                                                className='ant-input'
                                            />
                                        </CCol>
                                    </>
                                }

                                <CCol sm={2}>
                                    <CLabel>?????????</CLabel>
                                    <CInput
                                        name="roleName"
                                        onChange={onChange}
                                        className='ant-input'
                                    />
                                </CCol>

                                <CCol className="function-btns" sm={userAuth === `admin` ? 6 : 10}>
                                    <Button type='primary' loading={loadings} onClick={fn.getData}
                                            ref={btnRef}>??????</Button>

                                    {localStorage.getItem(`userAuth`) === 'admin' &&
                                    <Dropdown overlay={fn.excelMenus} trigger={['click']}>
                                        <Button type="primary" icon={<DownloadOutlined/>}/>
                                    </Dropdown>
                                    }
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={histList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={grid.colOption}
                                           components={{showCellRenderer: grid.createShowCellRenderer()}}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={previewVisible}
                visibleFunc={fn.visible.preview}
                title='??????/?????? ??????'
                content={roleServiceData}
            />
        </>
    )
};

export default Hist;