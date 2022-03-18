import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CSelect, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {cilSearch} from "@coreui/icons";
import TreeDataViewer from "../../components/TreeDataViewer";
import {Button, DatePicker, Popconfirm, message} from "antd";
import {FileTextOutlined} from "@ant-design/icons";
import DeleteFilled from "@ant-design/icons/es/icons/DeleteFilled";

const Manage = () => {
  const [getDataSignal, setGetDataSignal] = useState(false);
  const [loadings, setLoadings] = useState(true);
  const [returnLoadings, setReturnLoadings] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [roleServiceData, setRoleServiceData] = useState([]);
  const [authList, setAuthList] = useState([]);

  const [inputs, setInputs] = useState({
    datePoint: '',
    targetInfo: '',
    searchType: 'name',
    roleName: '',
    type: 1
  });
  const onChange = (e) => {
    const {name, value} = e.target;

    const nextInputs = {
      ...inputs,
      [name]: value,
    };
    setInputs(nextInputs)
  };

  async function getData() {
    setGetDataSignal(false);
    setLoadings(true);
    const url = "/REST/authority/appliedAuthority";
    const data = await GetData(url, inputs, 'a3');
    let returnData = [];

    setGetDataSignal(true);
    setLoadings(false);

    if (data === undefined) {
      message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
      return false;
    } else {
      for (let i = 0; i < data.length; i++) {
        const obj = {
          userName: data[i].NAME + ' (' + data[i].USER_ID + ')',
          userId: data[i].USER_ID,
          id: data[i].ROLE_ID,
          name: data[i].ROLE_NAME,
          from: common.numberDateToString(data[i].FROM_DATE),
          to: common.numberDateToString(data[i].TO_DATE),
          uuid: data[i].UUID
        };

        returnData.push(obj);
      }
    }

    setAuthList(returnData);
  }

  useEffect(() => {
    if (!getDataSignal) {
      common.showGridLoadingMsg();
    } else {
      common.hideGridLoadingMsg();
    }
  }, [getDataSignal]);
  useEffect(() => {
    getData();
  }, []);

  function previewVisibleFunc(visible) {
    setPreviewVisible(visible);
  }

  const authorityReturnInit = (targetValue) => {
    const obj = {
      nextStatus: 3,
      userId: targetValue.userId,
      id: targetValue.id,
      uuid: targetValue.uuid
    };

    setReturnLoadings(true);
    SetData("/REST/authority/authorityReturn", obj, 'a32', 8)
      .then((data) => {
        if (data) {
          message.success('회수되었습니다', 2);
        } else {
          message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
        }
      }).finally(() => {
      setReturnLoadings(true);
    });
  };

  async function getRoleInService(roleId) {
    const data = await GetData("/REST/authority/getRoleInService", {roleId: roleId}, 'a31');

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
      previewVisibleFunc(true);
    }

    function makeTreeData(array) {
      let returnData = [];
      let map = {};
      let isOpen = [];

      for (let i = 0; i < array.length; i++) {

        let obj = {key: array[i]['ID'], type: array[i]['TYPE'], title: array[i]['NAME']};

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
  }

  const PreviewService = (props) => {
    return (
      <CustomButton
        event={getRoleInService}
        data={props.data.id}
        icon={'cil-search'}
      />
    )
  };
  const AuthorityReturn = (props) => {
    return (
      <Popconfirm
        title="권한을 회수하시겠습니까?"
        onConfirm={() => {
          authorityReturnInit(props.data)
        }}
        okText="예"
        cancelText="아니오"
      >
        <Button loading={returnLoadings} className={'table-in-button'} style={{background: '#ff5722'}}>
          <DeleteFilled/>
        </Button>
      </Popconfirm>
    )
  };

  const frameworkComponents = {
    previewService: PreviewService,
    authorityReturn: AuthorityReturn
  };
  const colOption = [
    {headerName: "사용자", field: "userName"},
    {headerName: "역할", field: "name"},
    {headerName: "적용 일시", field: "from"},
    {headerName: "만료 일시", field: "to"},
    {headerName: "메뉴", cellRenderer: 'previewService'},
    {headerName: "회수", cellRenderer: 'authorityReturn'},
  ];

  const onDatetime = (datetime, value) => {
    onChange({target: {name: 'datePoint', value: value}})
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>사용자별 권한 목록</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol sm={2}>
                  <CLabel>구분</CLabel>
                  <CSelect name='searchType' className='ant-input' onChange={onChange}>
                    <option value="name">이름</option>
                    <option value="id">ID</option>
                  </CSelect>
                </CCol>

                <CCol sm={2}>
                  <CLabel>대상 정보</CLabel>
                  <CInput
                    name="targetInfo"
                    onChange={onChange}
                    className='ant-input'
                  />
                </CCol>

                <CCol sm={2}>
                  <CLabel>역할명</CLabel>
                  <CInput
                      name="roleName"
                      onChange={onChange}
                      className='ant-input'
                  />
                </CCol>

                <CCol sm={2}>
                  <CLabel>적용 일시</CLabel>
                  <DatePicker showTime name='datePoint' onChange={onDatetime}/>
                </CCol>


                <CCol className="function-btns" sm={4}>
                  <Button type='primary' loading={loadings} onClick={getData}>검색</Button>
                </CCol>
              </CRow>

              <CRow className="g-3">
                <SetAgGrid data={authList}
                           frameworkComponents={frameworkComponents}
                           colOption={colOption}
                />
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <Modal
        visible={previewVisible}
        visibleFunc={previewVisibleFunc}
        title='역할/메뉴 구조'
        content={<TreeDataViewer data={roleServiceData}/>}
      />
    </>
  )
};

export default Manage;