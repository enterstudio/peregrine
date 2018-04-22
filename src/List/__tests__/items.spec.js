import { Fragment, createElement } from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { Items } from '..';

configure({ adapter: new Adapter() });

const items = Object.entries({
    a: { id: 'a', val: '10' },
    b: { id: 'b', val: '20' },
    c: { id: 'c', val: '30' }
});

test('renders a fragment', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);

    expect(wrapper.type()).toEqual(Fragment);
});

test('renders a child for each item', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);

    expect(wrapper.children()).toHaveLength(items.length);
});

test('renders basic children of type `renderItem`', () => {
    const elementType = 'li';
    const props = { items, renderItem: elementType };
    const wrapper = shallow(<Items {...props} />);

    expect.assertions(items.length);
    wrapper.children().forEach(node => {
        expect(
            node
                .dive()
                .dive()
                .type()
        ).toEqual(elementType);
    });
});

test('renders composite children of type `renderItem`', () => {
    const Span = () => <span />;
    const props = { items, renderItem: Span };
    const wrapper = shallow(<Items {...props} />);

    expect.assertions(items.length);
    wrapper.children().forEach(node => {
        expect(node.dive().type()).toEqual(Span);
    });
});

test('passes correct props to each child', () => {
    const elementType = 'li';
    const props = { items, renderItem: elementType };
    const wrapper = shallow(<Items {...props} />);

    wrapper.children().forEach((node, i) => {
        const [key, item] = items[i];

        expect(node.key()).toEqual(key);
        expect(node.props()).toMatchObject({
            item,
            render: props.renderItem,
            hasFocus: false,
            isSelected: false,
            onBlur: wrapper.instance().handleBlur,
            onClick: expect.any(Function),
            onFocus: expect.any(Function)
        });
    });
});

test('indicates the child at index `cursor` has focus', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);
    const state = { cursor: 1, hasFocus: true };

    wrapper.setState(state);

    wrapper.children().forEach((node, i) => {
        const [, item] = items[i];

        expect(node.props()).toMatchObject({
            item,
            hasFocus: i === state.cursor,
            isSelected: false
        });
    });
});

test('indicates no child has focus if the list is not focused', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);
    const state = { cursor: 1, hasFocus: false };

    wrapper.setState(state);

    wrapper.children().forEach((node, i) => {
        const [, item] = items[i];

        expect(node.props()).toMatchObject({
            item,
            hasFocus: false,
            isSelected: false
        });
    });
});

test('indicates whether a child is selected', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);
    const selection = new Set().add('b').add('c');

    wrapper.setState({ selection });

    wrapper.children().forEach((node, i) => {
        const [key, item] = items[i];

        expect(node.props()).toMatchObject({
            item,
            hasFocus: false,
            isSelected: selection.has(key)
        });
    });
});

test('`syncSelection` calls `onSelectionChange`', () => {
    const onSelectionChange = jest.fn();
    const selection = new Set();
    const props = { items, onSelectionChange };
    const wrapper = shallow(<Items {...props} />);

    wrapper.instance().syncSelection(selection);
    expect(onSelectionChange).toHaveBeenCalledWith(selection);
});

test('updates `hasFocus` on child blur', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);

    wrapper.setState({ hasFocus: true });
    wrapper.childAt(0).simulate('blur');

    expect(wrapper.state('hasFocus')).toBe(false);
});

test('updates `cursor` and `hasFocus` on child focus', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);
    const index = 0;

    wrapper.childAt(index).simulate('focus');

    expect(wrapper.state()).toMatchObject({
        cursor: index,
        hasFocus: true
    });
});

test('updates `selection` on child click', () => {
    const props = { items };
    const wrapper = shallow(<Items {...props} />);
    const selection = new Set().add('b');

    wrapper.childAt(1).simulate('click');

    expect(wrapper.state('selection')).toEqual(selection);
});

test('memoizes child click handlers', () => {
    const props = { items };
    const instance = shallow(<Items {...props} />).instance();

    expect(instance.getClickHandler(0)).not.toBe(instance.getClickHandler(1));
    expect(instance.getClickHandler(0)).toBe(instance.getClickHandler(0));
});

test('memoizes child focus handlers', () => {
    const props = { items };
    const instance = shallow(<Items {...props} />).instance();

    expect(instance.getFocusHandler(0)).not.toBe(instance.getFocusHandler(1));
    expect(instance.getFocusHandler(0)).toBe(instance.getFocusHandler(0));
});