// @flow

/**
 * Copyright (c) Garuda Labs, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as Namespaces from 'hyperview/src/services/namespaces';
import * as Render from 'hyperview/src/services/render';
import type { DOMString, HvComponentProps } from 'hyperview/src/types';
import React, { PureComponent } from 'react';
import { LOCAL_NAME } from 'hyperview/src/types';
import { View } from 'react-native';
import { createProps } from 'hyperview/src/services';

export default class HvSelectSingle extends PureComponent<HvComponentProps> {
  static namespaceURI = Namespaces.HYPERVIEW;
  static localName = LOCAL_NAME.SELECT_SINGLE;
  static localNameAliases = [];
  constructor(props: HvComponentProps) {
    super(props);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidUpdate() {
    const { element } = this.props;
    if (element.hasAttribute('value')) {
      // NOTE(adam): we need to remove the attribute before
      // selection, since selection will update the component.
      const newValue = element.getAttribute('value');
      element.removeAttribute('value');
      this.onSelect(newValue);
    }
  }

  /**
   * Callback passed to children. Option components invoke this callback when selected.
   * SingleSelect will update the XML DOM so that only the selected option is has a
   * selected=true attribute.
   */
  onSelect = (selectedValue: ?DOMString) => {
    const { element, onUpdate } = this.props;
    const newElement = element.cloneNode(true);
    const options = newElement.getElementsByTagNameNS(
      Namespaces.HYPERVIEW,
      LOCAL_NAME.OPTION,
    );

    const isCumulative: boolean =
      newElement.getAttribute('cumulative') === 'true';

    // Calculate the index of the selected index. This is
    // used in the cumulative mode, to render the preceding
    // options as selected.
    let selectedIndex: ?number = null;
    if (isCumulative) {
      for (let i = 0; i < options.length; i += 1) {
        const opt = options.item(i);
        if (opt) {
          const value = opt.getAttribute('value');
          if (value === selectedValue) {
            selectedIndex = i;
          }
        }
      }
    }

    for (let i = 0; i < options.length; i += 1) {
      const opt = options.item(i);
      if (opt) {
        const value = opt.getAttribute('value');
        // Only the option with the selected value
        // should be rendered as selected.
        opt.setAttribute(
          'selected',
          value === selectedValue ? 'true' : 'false',
        );
        // If using the cumulative mode, all options
        // should be updated with a flag indicating if
        // they should render as selected. Options
        // preceding the selected one should be selected,
        // the later options should be unselected.
        if (
          isCumulative &&
          selectedIndex !== null &&
          selectedIndex !== undefined
        ) {
          opt.setAttribute(
            'selected-as-cumulative',
            i < selectedIndex ? 'true' : 'false',
          );
        }
      }
    }
    onUpdate('#', 'swap', element, { newElement });
  };

  render() {
    const { element, stylesheets, onUpdate, options } = this.props;
    if (element.getAttribute('hide') === 'true') {
      return null;
    }
    const props = createProps(element, stylesheets, { ...options });
    return React.createElement(
      View,
      props,
      ...Render.renderChildren(element, stylesheets, onUpdate, {
        ...options,
        onSelect: this.onSelect,
      }),
    );
  }
}
