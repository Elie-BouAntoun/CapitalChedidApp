import { GridSearchOptions, GridSortOrder, DataTypes } from '../_shared/enum';

export interface QuotationsGridColumns {
  ID: number;
  DBName: string;
  DisplayName: string;
  DataType: number;
  IsSearchable: boolean;
  IsSortable: boolean;
  IsUsedInFilter: boolean; // computed to show the filter icon if column has filter
}

export interface Quotations {
  ID: number;
  QuotationNo: string;
  PolicyOwner: string;
  CarMake: string;
  YearOfMake: number;
  Status: number;
  CreationDate: Date;
}

export interface QuotationSearchCriteriaDto {
  DBName: string;
  DataType: DataTypes;
  SearchOption: GridSearchOptions;
  Value: string | number | Date | boolean;
}

export interface QuotationSortDto {
  DBName: string;
  DataType: DataTypes;
  SortOrder: GridSortOrder;
}

