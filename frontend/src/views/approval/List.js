import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {Button, message, Popconfirm, Steps} from "antd";
import {UserOutlined} from "@ant-design/icons";

const {Step} = Steps;

const List = () => {
  const [getDataSignal, setGetDataSignal] = useState(false);
  const [loadings, setLoadings] = useState(true);
  const [approvalReturnUpdate, setApprovalReturnUpdate] = useState(false);
  const [approvalOkUpdate, setApprovalOkUpdate] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [approvalList, setApprovalList] = useState([]);
  const [detailInfo, setDetailInfo] = useState();
  const [detailUuid, setDetailUuid] = useState('');
  const [detailTargetId, setDetailTargetId] = useState('');
  const [flowIdx, setFlowIdx] = useState(0);

  const [inputs, setInputs] = useState({
    rsn: '',
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
    const url = "/REST/approval/getApprovalList";
    const condition = inputs;
    const data = await GetData(url, condition, 'b0');
    let returnData = [];

    setGetDataSignal(true);
    setLoadings(false);
    if (data === undefined) {
      message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
      return false;
    } else {
      for (let i = 0; i < data.length; i++) {
        const requestInfo = JSON.parse(data[i].REQUEST_INFO);

        if (parseInt(data[i].TYPE) === 0) {
          let summary = [];
          let from = [];
          let to = [];

          for (let j = 0; j < requestInfo.length; j++) {
            summary.push(requestInfo[j].name);
            from.push(common.numberDateToString(requestInfo[j].from));
            to.push(common.numberDateToString(requestInfo[j].to));
          }

          const obj = {
            requestTime: common.numberDateToString(data[i].REQUEST_TIME),
            type: '권한',
            summary: summary,
            name: data[i].NAME,
            from: from,
            to: to,
            rsn: data[i].RSN,
            uuid: data[i].UUID
          };

          returnData.push(obj);
        } else {
          const obj = {
            requestTime: common.numberDateToString(data[i].REQUEST_TIME),
            type: '매핑',
            summary: data[i].SUMMARY,
            name: data[i].NAME,
            from: '',
            to: '',
            rsn: data[i].RSN,
            uuid: data[i].UUID
          };

          returnData.push(obj);
        }
      }
    }

    setApprovalList(returnData)
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

  function detailVisibleFunc(visible) {
    setDetailVisible(visible);
  }

  const requestUpdate = (status, msg) => {
    const obj = {
      uuid: detailUuid,
      rsn: inputs.rsn,
      flowIdx: flowIdx,
      status: status
    };

    if (inputs.rsn.length === 0) {
      message.warning('결재 의견을 입력하세요', 2);
      return;
    }

    if (status === 1) {
      setApprovalOkUpdate(true);
    } else {
      setApprovalReturnUpdate(true);
    }

    SetData("/REST/approval/updateApprovalInfo", obj, 'b0', 6)
      .then((data) => {
        if (data) {
          message.success(msg, 2);
          getData();
          detailVisibleFunc(false);
        } else {
          message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
        }
      }).finally(() => {
      if (status === 1) {
        setApprovalOkUpdate(false);
      } else {
        setApprovalReturnUpdate(false);
      }
    });
  };

  const showDetails = async (uuid) => {
    setDetailVisible(true);

    const data = await GetData('/REST/authority/getRequestOne', {uuid: uuid, type: 'hist'}, 'b01');
    setDetailUuid(uuid);
    setDetailTargetId(parseInt(data[0].TARGET_ID));
    const dataType = parseInt(data[0].TYPE);
    const flow = JSON.parse(data[0].FLOW);
    const requestInfo = JSON.parse(data[0].REQUEST_INFO);
    const BrCheck = (index, value) => {
      return (
        <div key={common.createUuid()}>
          {index !== 0
            ? <br/>
            : ''}
          {value}
        </div>
      )
    };
    const Roles = () => {
      return (<>
        {requestInfo.map((value, index) => (
          BrCheck(index, value.name)
        ))}
      </>)
    };
    const Froms = () => {
      return (<>
        {requestInfo.map((value, index) => (
          BrCheck(index, common.numberDateToString(value.from))
        ))}
      </>)
    };
    const Tos = () => {
      return (<>
        {requestInfo.map((value, index) => (
          BrCheck(index, common.numberDateToString(value.to))
        ))}
      </>)
    };
    let requestInfoForMapping;

    if(dataType === 1){
      requestInfoForMapping = JSON.parse(data[0].REQUEST_INFO_NAME);
      requestInfoForMapping.ROLES = requestInfoForMapping.ROLES.split(",");
      requestInfoForMapping.SERVICES = requestInfoForMapping.SERVICES.split(",");
    }

    const ApprovalSteps = (props) => {
      return (
        <>
          <Steps type="navigation">
            {props.data && props.data.map((value, index) => {
              let status = [];

              if (value.id === detailTargetId) {
                setFlowIdx(index);
              }

              switch (parseInt(value.status)) {
                case 0:
                  status[0] = '미승인';
                  status[1] = (data[0].TARGET_ID === value.id && data[0].STATUS === '0')
                    ? 'process'
                    : 'wait';
                  break;
                case 1:
                  status[0] = '승인';
                  status[1] = 'finish';
                  break;
                case 2:
                  status[0] = '반려';
                  status[1] = 'error';
                  break;
                case 3:
                  status[0] = '회수';
                  status[1] = 'error';
                  break;
                case 4:
                  status[0] = '반환';
                  status[1] = 'error';
                  break;
              }

              const icon = <UserOutlined/>;
              const description = parseInt(value.status) !== 0
                ? (<>{status[0]}<br/>{common.numberDateToString(value.date)}</>)
                : (<>{status[0]}</>);

              return <Step key={index} status={status[1]} title={value.name}
                           description={description} icon={icon}/>
            })}
          </Steps>
        </>
      )
    };

    const ApprovalDetails = (
      <div className='approval-detail-content'>
        <div className={'limit-max-width'}>
          <ApprovalSteps data={flow}/>
        </div>

        <div className='approval-info' style={{marginTop: '15px'}}>
          <table className="approval-detail-table">
            <tbody>
            <tr>
              <td className="title">요청일시</td>
              <td className="value" colSpan="3">{common.numberDateToString(data[0].REQUEST_TIME)}</td>
            </tr>
            <tr>
              <td className="title">요청자</td>
              <td className="value" colSpan="3">{data[0].NAME}</td>
            </tr>
            <tr>
              <td className="title" rowSpan="2">요청정보</td>
              {dataType === 0
                ? <>
                  <td className="title">역할명</td>
                  <td className="title">적용일시</td>
                  <td className="title">만료일시</td>
                </>
                : <>
                  <td className="title">매핑 역할명</td>
                  <td className="title">매핑 서비스명</td>
                </>
              }
            </tr>
            <tr>
              {dataType === 0
                ? <>
                  <td className="value">{<Roles/>}</td>
                  <td className="value">{<Froms/>}</td>
                  <td className="value">{<Tos/>}</td>
                </>
                : <>
                  <td className="value">
                    {requestInfoForMapping.ROLES.map((value, index) => {
                      return <>{index === 0 ? '' : <br/>}{value}</>
                    })}
                  </td>
                  <td className="value">
                    {requestInfoForMapping.SERVICES.map((value, index) => {
                      return <>{index === 0 ? '' : <br/>}{value}</>
                    })}
                  </td>
                </>
              }
            </tr>
            <tr>
              <td className="title">요청사유</td>
              <td className="value" colSpan="3">{data[0].RSN}</td>
            </tr>
            <tr>
              <td className="title">결재 의견</td>
              <td className="value" colSpan="3">
                <textarea rows='4'
                          name='rsn'
                          onChange={onChange}
                ></textarea></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    );

    setDetailInfo(ApprovalDetails);
  };

  const ApprovalDetail = (props) => {
    return (
      <CustomButton
        event={showDetails}
        data={props.value}
        icon={'cil-search'}
      />
    )
  };

  const requestReturn = () => {
    requestUpdate(2, '요청을 반려 하였습니다');
  };
  const requestOk = () => {
    requestUpdate(1, '요청을 승인 하였습니다');
  };
  const approvalModalButtons = (
    <div key={'buttons'}>
      <Button onClick={() => {
        detailVisibleFunc(false)
      }}>닫기
      </Button>
      <Popconfirm
        title="결재를 반려하시겠습니까?"
        onConfirm={requestReturn}
        okText="예"
        cancelText="아니오"
      >
        <Button loading={approvalReturnUpdate} style={{background: '#e81d24', color: 'white'}}>반려</Button>
      </Popconfirm>

      <Popconfirm
        title="결재를 승인하시겠습니까?"
        onConfirm={requestOk}
        okText="예"
        cancelText="아니오"
      >
        <Button loading={approvalOkUpdate} type='primary'>승인</Button>
      </Popconfirm>
    </div>
  );
  const frameworkComponents = {
    approvalDetail: ApprovalDetail,
  };
  const colOption = [
    {headerName: "요청 일시", field: "requestTime"},
    {headerName: "타입", field: "type"},
    {headerName: "요청자", field: "name"},
    {headerName: "요청대상 요약", field: "summary"},
    {headerName: "적용 일시", field: "from"},
    {headerName: "만료 일시", field: "to"},
    {headerName: "사유", field: "rsn"},
    {headerName: "Action", field: "uuid", cellRenderer: 'approvalDetail'},
  ];

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>결재 목록</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol sm={2}>
                  <CLabel>요청자</CLabel>
                  <CInput
                    name="userName"
                    onChange={onChange}
                    className='ant-input'
                  />
                </CCol>

                <CCol className="function-btns" sm={10}>
                  <Button type='primary' loading={loadings} onClick={getData}>검색</Button>
                </CCol>
              </CRow>

              <CRow className="g-3">
                <SetAgGrid data={approvalList}
                           frameworkComponents={frameworkComponents}
                           colOption={colOption}
                />
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <Modal
        visible={detailVisible}
        visibleFunc={detailVisibleFunc}
        title='결재 정보'
        content={detailInfo}
        type='modal-big-size'
        buttons={approvalModalButtons}
      />
    </>
  )
};

export default List;