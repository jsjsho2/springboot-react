import React, {useEffect, useRef, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {Button, message, Popconfirm} from "antd";
import DeleteFilled from "@ant-design/icons/es/icons/DeleteFilled";
import {FileTextOutlined} from "@ant-design/icons";

const List = () => {
    const btnRef = useRef(null);
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [loadings, setLoadings] = useState(true);
    const [returnLoadings, setReturnLoadings] = useState(false);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [authList, setAuthList] = useState([]);
    const [roleServiceData, setRoleServiceData] = useState([]);
    const [inputs, setInputs] = useState({
        roleName: '',
        type: 0
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
            const url = "/REST/authority/appliedAuthority";
            const data = await GetData(url, inputs, 'a0');

            setGetDataSignal(true);
            setLoadings(false);
            if (data === undefined) {
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();
            }

            setAuthList(data);
        },
        PreviewService: props => {
            return (
                <CustomButton
                    event={fn.getRoleInService}
                    data={props.data.ROLE_ID}
                    icon={'cil-search'}
                />
            )
        },
        getRoleInService: async roleId => {
            const data = await GetData("/REST/authority/getRoleInService", {roleId: roleId}, 'a01');

            if (data === undefined) {
                setPreviewVisible(false);
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                setPreviewVisible(false);
                message.warning('매핑된 서비스가 없습니다', 2);
                return false;
            } else {
                setRoleServiceData(makeTreeData(data));
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
        },
        AuthorityReturn: props => {

            return (
                props.data.TARGET_UUID === null
                    ? <>반환 불가</>
                    : <Popconfirm
                        title="권한을 반환하시겠습니까?"
                        onConfirm={() => {
                            fn.authorityReturnModalInit(props.data);
                        }}
                        okText="예"
                        cancelText="아니오"
                    >
                        <Button loading={returnLoadings} className={'table-in-button'} style={{background: '#ff5722'}}>
                            <DeleteFilled/>
                        </Button>
                    </Popconfirm>
            )
        },
        authorityReturnModalInit: rowData => {
            setReturnLoadings(true);
            const condition = {
                uuid: rowData.UUID,
                nextStatus: 4,
                userId: rowData.USER_ID,
                id: rowData.ROLE_ID
            };

            SetData("/REST/authority/authorityReturn", condition, 'a02', 7)
                .then((data) => {
                    if (data) {
                        message.success('반환되었습니다', 2);
                        fn.getData();
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    }
                }).finally(() => setReturnLoadings(false));
        }
    };

    const grid = {
        colOption: [
            {headerName: "역할", field: "ROLE_NAME"},
            {
                headerName: "적용 일시", field: "FROM_DATE", valueFormatter:
                    function (params) {
                        return parseInt(params.value) === 0 ? '조직별 기본 권한' : common.numberDateToString(params.value)
                    }
            },
            {
                headerName: "만료 일시", field: "TO_DATE", valueFormatter:
                    function (params) {
                        return parseInt(params.value) === 0 ? '조직별 기본 권한' : common.numberDateToString(params.value)
                    }
            },
            {headerName: "메뉴", field: "ROLE_ID", cellRenderer: 'previewService'},
            {headerName: "반환", field: "UUID", cellRenderer: 'authorityReturn'},
        ]
    }

    const frameworkComponents = {
        previewService: fn.PreviewService,
        authorityReturn: fn.AuthorityReturn
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>적용중인 권한 목록</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3" onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    btnRef.current.dispatchEvent(new Event('click', {bubbles: true}));
                                }
                            }}>
                                <CCol sm={2}>
                                    <CLabel>역할명</CLabel>
                                    <CInput
                                        name="roleName"
                                        onChange={onChange}
                                        className='ant-input'
                                    />
                                </CCol>

                                <CCol className="function-btns" sm={10}>
                                    <Button type="primary" loading={loadings} onClick={fn.getData} ref={btnRef}>
                                        검색
                                    </Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={authList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={grid.colOption}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={previewVisible}
                visibleFunc={fn.visible.preview}
                title='역할/메뉴 구조'
                content={<TreeDataViewer data={roleServiceData}/>}
            />
        </>
    )
};

export default List;