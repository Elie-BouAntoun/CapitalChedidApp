import { Injectable } from '@angular/core';
import * as $ from 'jquery';

@Injectable()
export class SharedFunctions {
  AnimatePageOnLoad() {
    $('.page_container').fadeIn(800);

    setTimeout(() => {
      $('.animated_section').animate({ opacity: 1, "margin-top": "0px" }, 800);
    }, 400);
  }

  FadePageOnClose() {
    $('.page_container').fadeOut(800);
  }
}
