import { Polymer, html } from '@polymer/polymer/polymer-legacy';
import './noflo-icon';

Polymer({
  hostAttributes: {
    tabindex: '0'
  },

  _template: html`
    <style>
      .search-results-header h1 {
        color: var(--noflo-ui-border);
        padding-left: 25px;
        font-size: 12px !important;
      }
      .search-results-header i {
        padding: 0;
        margin: 0;
        line-height: 36px;
        width: 36px;
        left: -10px;
        position: absolute;
        text-align: center;
      }

      .search-results-list {
        -webkit-box-sizing: border-box;
        -mox-box-sizing: border-box;
        box-sizing: border-box;
        list-style: none;
        margin: 0;
        padding: 0;
        background-color: var(--noflo-ui-background);
        border-right: none;
      }

      .search-results-item {
        -webkit-box-sizing: border-box;
        -mox-box-sizing: border-box;
        box-sizing: border-box;
        min-height: 36px;
        position: relative;
        cursor: cell;
        padding-top: 18px !important;
        padding-right: 12px !important;
      }
      .search-results-item i {
        color: var(--noflo-ui-text-highlight);
        position: absolute;
        top: 18px;
        left: 0;
        width: 36px;
        text-align: center;
        padding: 0;
        margin: 0;
        font: normal normal normal 14px/1 FontAwesomeSVG;
      }
      .search-results-item h2 {
        color: var(--noflo-ui-text-highlight);
        position: absolute;
        margin: 0;
        display: block;
        left: 36px;
        top: 18px;
        height: 36px;
        width: calc(100% - 36px);
        font-size: 12px;
        text-overflow: ellipsis;
        text-transform: uppercase;
        white-space: nowrap;
        overflow-x: hidden;
      }
      .search-results-item p {
        position: relative;
        display: block;
        left: 8px;
        padding: 0px;
        margin: 0px;
        margin-top: 24px;
        height: auto;
        line-height: calc(36px / 3);
        font-size: 10px;
        color: var(--noflo-ui-text);
        text-shadow: var(--noflo-ui-background) 0px 1px 1px;
      }
      .search-results-item.selected {
        background-color: var(--noflo-ui-text-highlight);
        color: var(--noflo-ui-background);
        border: none;
        outline: none;
      }
      .search-results-item.selected h2,
      .search-results-item.selected p {
        color: var(--noflo-ui-background);
      }
    </style>
    <ul class="search-results-list">
      <template is="dom-repeat" items="{{results}}" as="result" index-as="index">
        <li class="search-results-item" on-click="clicked" data-index\$="{{index}}">
          <i><noflo-icon icon="[[result.icon]]" fallback="cog"></noflo-icon></i>
          <h2>[[result.label]]</h2>
          <p>[[result.description]]</p>
        </li>
      </template>
    </ul>
`,

  is: 'noflo-search-library-results',

  properties: {
    results: {
      type: Array,
      value() {
        return [];
      },
      notify: true,
    },
    search: {
      type: String,
      value: '',
      notify: true,
    },
    selectedIndex: {
      type: Number,
      value: -1,
    },
  },

  attached() {
    this.addEventListener('keydown', this.handleKeydown.bind(this));
  },

  clicked(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const index = event.currentTarget.getAttribute('data-index');
    const result = this.results[index];
    if (!result || !result.action) {
      return;
    }
    this.fire('resultclick', result);
    result.action();
  },

  handleKeydown(event) {
    if (event.keyCode === 38) { // up
      event.preventDefault();
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.focusResult(this.selectedIndex);
      } else {
        this.clearSelection();
        this.fire('focusinput');
        return;
      }
    } else if (event.keyCode === 40) { // down
      event.preventDefault();
      if (this.selectedIndex < this.results.length - 1) {
        this.selectedIndex++;
        this.focusResult(this.selectedIndex);
      }
    } else if (event.keyCode === 13) { // enter
      event.preventDefault();
      this.activateResult(this.selectedIndex);
    } else if (event.keyCode === 27) { // escape
      event.preventDefault();
      this.fire('clearsearch');
      return;
    }
    this.focus();
  },

  activateResult(index) {
    if (index < 0) {
      return;
    }
    const target = this.shadowRoot.querySelector(`[data-index="${index}"]`);
    if (!target) {
      return;
    }
    this.clicked({
      preventDefault() {},
      currentTarget: target,
    });
  },

  focusResult(index) {
    this.selectedIndex = index;
    const items = this.shadowRoot.querySelectorAll('.search-results-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    const selectedItem = items[index];
    if (!selectedItem) {
      return;
    }
    if (typeof selectedItem.scrollIntoViewIfNeeded === 'function') {
      selectedItem.scrollIntoViewIfNeeded();
      return;
    }
    if (typeof selectedItem.scrollIntoView === 'function') {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  },

  clearSelection() {
    this.selectedIndex = -1;
    const items = this.shadowRoot.querySelectorAll('.search-results-item');
    items.forEach((item) => {
      item.classList.remove('selected');
    });
  },
});
