import { Pipe, PipeTransform } from '@angular/core';
import { DataTypes } from '../enum';

@Pipe({name: 'transform'})
export class TransformPipe implements PipeTransform {
  transform(p_value: string | number | Date, p_data_type: DataTypes): string | number | Date {
    if (p_data_type == DataTypes.Date) {
      let date_value = new Date(p_value);
      return date_value.getDate() + "/" + (date_value.getMonth() + 1) + "/" + date_value.getFullYear();
    }

    return p_value;
  }
}
