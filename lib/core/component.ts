import {
  Component,
  Input,
  OnDestroy,
  OnChanges,
  ElementRef,
  Output,
  EventEmitter,
  SimpleChanges,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { LazyService } from 'nu-lazy';
import { G2ChartConfig } from './config';

declare var window: any;

@Component({
  selector: 'g2-chart',
  template: ``,
  styles: [ `g2-chart { display: block; } ` ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class G2ChartComponent implements OnInit, OnDestroy, OnChanges {
  static idPool = 0;
  private instance: any;
  private id: string;
  private initFlag = false;

  @Input() options: any;
  @Output() readonly ready = new EventEmitter<any>();
  @Output() readonly destroy = new EventEmitter();

  constructor(
    private el: ElementRef,
    private config: G2ChartConfig,
    private lazySrv: LazyService
  ) {}

  ngOnInit() {
    // 构建一个虚拟id
    this.id = 'angular-g2-' + ++G2ChartComponent.idPool;
    this.el.nativeElement.id = this.id;
    this.initFlag = true;

    // 已经存在对象无须进入懒加载模式
    if (window.G2) {
      this.init();
      return;
    }

    this.lazySrv.load(this.config.js).then(() => this.init());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) this.init();
  }

  private init(options?: any) {
    if (!this.initFlag) return;

    if (this.instance) {
      this._destroy(false);
    }
    // 强制设置container为null，并使用 `id` 初始化
    this.instance = new window.G2.Chart(
      Object.assign({}, this.options, {
        id: this.id,
        container: null,
      }),
    );
    this.ready.emit(this.instance);
  }

  private _destroy(needNotify: boolean = false) {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
    if (needNotify) this.destroy.emit();
  }

  /**
   * 获取Chart实例
   */
  get Instance(): any {
    return this.instance;
  }

  ngOnDestroy() {
    this._destroy(true);
  }
}
