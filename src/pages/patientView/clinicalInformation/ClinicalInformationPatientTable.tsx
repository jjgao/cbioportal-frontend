import * as React from "react";
import {ClinicalData} from "../../../shared/api/generated/CBioPortalAPI";
import LazyMobXTable from "shared/components/lazyMobXTable/LazyMobXTable";

import styles from './style/patientTable.module.scss';

export interface IClinicalInformationPatientTableProps {
    data: ClinicalData[];
    showTitleBar?: boolean;
    cssClass?:string;
    showFilter?:boolean;
    showCopyDownload?:boolean;
}

class PatientTable extends LazyMobXTable<IPatientRow> {}

interface IPatientRow {
    attribute: string;
    value: string;
};

export default class ClinicalInformationPatientTable extends React.Component<IClinicalInformationPatientTableProps, {}> {

    public render() {

        const tableData = this.props.data && this.props.data.map((el: ClinicalData) => ({
            attribute: el.clinicalAttribute.displayName || '',
            value: el.value
        }));

        return (
            <PatientTable
                  data={tableData}
                  columns={[
                      {   name:'Attribute',
                          render:(data)=><span>{data.attribute}</span>,
                          filter: (data:IPatientRow, filterString:string, filterStringUpper:string) =>
                            data.attribute.toString().toUpperCase().indexOf(filterStringUpper) > -1
                      },
                      {
                          name:'Value',
                          render: (data)=><span>{data.value}</span>,
                          filter: (data:IPatientRow, filterString:string, filterStringUpper:string) =>
                            data.value.toString().toUpperCase().indexOf(filterStringUpper) > -1
                      }]}
                  showPagination={false}
                  showColumnVisibility={false}
                  className={styles.patientTable}
                  showFilter={(this.props.showFilter === false) ? false : true }
                  showCopyDownload={(this.props.showCopyDownload === false) ? false : true }
            />
        );
    }
}


