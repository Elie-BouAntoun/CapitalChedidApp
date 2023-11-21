import { Component, AfterViewInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { SharedFunctions } from '../_shared/shared-functions';
import { DataTypes, GridSearchOptions, GridSortOrder } from '../_shared/enum';
import Settings from '../settings.json';

import { QuotationsGridColumns, Quotations, QuotationSearchCriteriaDto, QuotationSortDto } from './home.model';

import { HomeService } from './home.service';

@Component({
  selector: 'home',
  templateUrl: './home.html',
  providers: [HomeService]
})
export class HomeComponent implements AfterViewInit {
  constructor(
    public shared_functions: SharedFunctions,
    public home_service: HomeService
  ) { }

  private _settings = Settings;

  public search_value: string = "";
  public quotations_api_data: Quotations[] = [];
  public quotations_filtered_data: Quotations[] = [];
  public quotations_grid_datasource: Quotations[] = [];
  public quotations_grid_columns: QuotationsGridColumns[] = [];
  public quotations_search_criterias: QuotationSearchCriteriaDto[] = [];
  public quotations_search_column_criteria: QuotationSearchCriteriaDto = <QuotationSearchCriteriaDto>{};
  public quotations_sort: QuotationSortDto = <QuotationSortDto>{};
  public quotations_sort_visible: string = "";
  public quotations_nb_item_page: number = this._settings.AppSettings.GridNumberOfItemsPerPage;
  public quotations_nb_pages: number[] = [1];
  public current_page_nb: number = 0;

  public data_types_enum = DataTypes;
  public grid_search_options_enum = GridSearchOptions;
  public grid_sort_orrder_enum = GridSortOrder;

  ngAfterViewInit() {
    this.shared_functions.AnimatePageOnLoad();
    this.SetDefaultSorting();

    // call apis in AfterViewInit and not in OnInit so the preloader works
    let quotations_api = this.home_service.GetQuotations();
    let quotations_grid_columns_api = this.home_service.GetQuotationsGridColumns();

    forkJoin([quotations_api, quotations_grid_columns_api]).subscribe(joined_apis_data => {
      this.quotations_api_data = joined_apis_data[0];
      this.quotations_filtered_data = joined_apis_data[0];
      this.quotations_grid_columns = joined_apis_data[1];

      this.ApplyFilter();
    });
  }

  Search() {
    this.search_value = this.search_value.trim();
    this.quotations_search_criterias = [];
    this.ApplyFilter();
  }

  SetSearchOption(p_option: number) {
    this.quotations_search_column_criteria.SearchOption = p_option;
  }

  ToggleFilterBox(p_column_data: QuotationsGridColumns) {
    if (p_column_data.DBName != this.quotations_search_column_criteria.DBName
      || [undefined, ""].includes(this.quotations_search_column_criteria.DBName)
    ) {
      // when a filter box is already opened and the user direclty opens the filter box of another column
      // or if quotations_search_column_criteria is empty
      // then show the filter box
      this.quotations_search_column_criteria = this.quotations_search_criterias.filter(x => x.DBName == p_column_data.DBName)[0];

      if (this.quotations_search_column_criteria == null) {
        this.quotations_search_column_criteria = <QuotationSearchCriteriaDto>{
          DBName: p_column_data.DBName,
          DataType: p_column_data.DataType,
          SearchOption: this.grid_search_options_enum.Equals,
          Value: (p_column_data.DataType == this.data_types_enum.String ? "" : null)
        };
      }
    }
    else {
      // clearing quotations_search_column_criteria will hide the filter box
      this.quotations_search_column_criteria = <QuotationSearchCriteriaDto>{};
    }
  }

  FilterGrid() {
    if (this.quotations_search_column_criteria.DataType == this.data_types_enum.String) {
      this.quotations_search_column_criteria.Value = this.quotations_search_column_criteria.Value.toString().trim();
    }

    let column = this.quotations_grid_columns.filter(x => x.DBName == this.quotations_search_column_criteria.DBName)[0];

    if ((this.quotations_search_column_criteria.DataType == this.data_types_enum.String && this.quotations_search_column_criteria.Value == "")
      || ([this.data_types_enum.Int, this.data_types_enum.Date, this.data_types_enum.List].includes(this.quotations_search_column_criteria.DataType) && this.quotations_search_column_criteria.Value == null)
    ) {
      this.quotations_search_criterias = this.quotations_search_criterias.filter(x => x.DBName != this.quotations_search_column_criteria.DBName);
      column.IsUsedInFilter = false;
    }
    else {
      let search_criteria = this.quotations_search_criterias.filter(x => x.DBName == this.quotations_search_column_criteria.DBName)[0];

      if (search_criteria == null) {
        this.quotations_search_criterias.push(this.quotations_search_column_criteria);
      }
      else {
        search_criteria.Value = this.quotations_search_column_criteria.Value;
      }

      column.IsUsedInFilter = true;
    }

    this.ToggleFilterBox(column);
    this.ApplyFilter();
  }

  ClearFilter() {
    this.quotations_search_criterias = this.quotations_search_criterias.filter(x => x.DBName != this.quotations_search_column_criteria.DBName);

    let column = this.quotations_grid_columns.filter(x => x.DBName == this.quotations_search_column_criteria.DBName)[0];
    column.IsUsedInFilter = false;
    this.ToggleFilterBox(column);
    this.ApplyFilter();
  }

  ApplyFilter() {
    this.quotations_filtered_data = this.quotations_api_data;

    if (this.search_value != "" || this.quotations_search_criterias.length > 0) {
      let filtered_columns_dbname: string[] = this.quotations_grid_columns.filter(x => x.IsSearchable == true).map(item => { return item.DBName });

      this.quotations_filtered_data = this.quotations_filtered_data.filter(x => {
        let is_row_valid = false;

        if (this.search_value != "") {
          for (let col = 0; col < filtered_columns_dbname.length; col++) {
            if (x[filtered_columns_dbname[col]].toLowerCase().indexOf(this.search_value.toLowerCase()) > -1) {
              is_row_valid = true;
              break;
            }
          }
        }
        else {
          is_row_valid = true;
        }

        if (is_row_valid == true) {
          if (this.quotations_search_criterias.length > 0) {
            let eval_condition: string = "";

            for (let i = 0; i < this.quotations_search_criterias.length; i++) {
              let search_criteria = this.quotations_search_criterias[i];

              if (eval_condition != "") {
                eval_condition += " and ";
              }

              switch (search_criteria.DataType) {
                case this.data_types_enum.String: {
                  let search_criteria_value = search_criteria.Value.toString().toLowerCase();

                  switch (search_criteria.SearchOption) {
                    case this.grid_search_options_enum.Equals: {
                      eval_condition += "'" + x[search_criteria.DBName].toLowerCase() + "'" + " == " + "'" + search_criteria_value + "'";
                      break;
                    }
                    case this.grid_search_options_enum.Contains: {
                      eval_condition += "'" + x[search_criteria.DBName].toLowerCase() + "'" + ".indexOf(" + "'" + search_criteria_value + "'" + ") > -1";
                      break;
                    }
                    case this.grid_search_options_enum.StartsWith: {
                      eval_condition += "'" + x[search_criteria.DBName].toLowerCase() + "'" + ".startsWith(" + "'" + search_criteria_value + "'" + ")";
                      break;
                    }
                    case this.grid_search_options_enum.EndsWith: {
                      eval_condition += "'" + x[search_criteria.DBName].toLowerCase() + "'" + ".endsWith(" + "'" + search_criteria_value + "'" + ")";
                      break;
                    }                    
                  }
                  break;
                }
              }
            }

            if (eval(eval_condition)) {
              is_row_valid = true;
            }
            else {
              is_row_valid = false;
            }
          }                   
        }

        return is_row_valid;
      });
    }
   
    this.ApplySort();
  }

  SetDefaultSorting() {
    this.quotations_sort = <QuotationSortDto>{
      DBName: "QuotationNo",
      DataType: this.data_types_enum.String,
      SortOrder: GridSortOrder.Asc
    };
  }

  ToggleSortBox(p_column_dbname: string) {
    this.quotations_sort_visible = p_column_dbname;
  }

  SortGrid(p_data_type: DataTypes, p_sort_order: GridSortOrder) {
    this.quotations_sort = <QuotationSortDto>{
      DBName: this.quotations_sort_visible,
      DataType: p_data_type,
      SortOrder: p_sort_order
    };

    this.ToggleSortBox("");
    this.ApplySort();
  }

  ClearSorting() {
    this.SetDefaultSorting();
    this.ApplySort();
  }

  ApplySort() {
    this.quotations_filtered_data = this.quotations_filtered_data.sort((a, b) => {
      let a_value = a[this.quotations_sort.DBName];
      let b_value = b[this.quotations_sort.DBName];

      if (this.quotations_sort.DataType == this.data_types_enum.Date) {
        a_value = new Date(a_value);
        b_value = new Date(b_value);
      }

      switch (this.quotations_sort.SortOrder) {
        case GridSortOrder.Desc: {
          if (a[this.quotations_sort.DBName] < b[this.quotations_sort.DBName]) {
            return 1;
          }
          else {
            return -1;
          }
        }
        default: { // GridSortOrder.Asc
          if (a[this.quotations_sort.DBName] < b[this.quotations_sort.DBName]) {
            return -1;
          }
          else {
            return 1;
          }
        }
      }
    });
    this.ApplyPaging();
  }

  ApplyPaging() {
    this.quotations_nb_pages = [...Array(Math.ceil(this.quotations_filtered_data.length / this.quotations_nb_item_page)).keys()];// Array(Math.ceil(this.quotations_filtered_data.length / this.quotations_nb_item_page)).fill(1);
    this.GoToPage(this.current_page_nb);
  }

  GoToPage(p_page_nb) {
    this.current_page_nb = p_page_nb;
    let start_index = (this.current_page_nb * this.quotations_nb_item_page);
    let end_index = start_index + this.quotations_nb_item_page;
    this.quotations_grid_datasource = this.quotations_filtered_data.slice(start_index, end_index);
  }
}
