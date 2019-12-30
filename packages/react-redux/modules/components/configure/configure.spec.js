import React from 'react';
import { renderShallowly } from '@flopflip/test-utils';
import { ConfigureAdapter } from '@flopflip/react';
import Configure from './configure';

jest.mock('../../hooks');

const ChildComponent = () => <div />;
const createTestProps = custom => ({
  adapter: {
    configure: jest.fn(),
    reconfigure: jest.fn(),
    getIsReady: jest.fn(),
  },
  adapterArgs: {
    fooId: 'foo-id',
  },

  ...custom,
});

describe('rendering', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = createTestProps();
    wrapper = renderShallowly(<Configure {...props} />);
  });

  it('should render a `<ConfigureAdapter>`', () => {
    expect(wrapper).toRender(ConfigureAdapter);
  });

  describe('with `children`', () => {
    let props;

    beforeEach(() => {
      props = createTestProps();

      wrapper = renderShallowly(
        <Configure {...props}>
          <ChildComponent />
        </Configure>
      );
    });

    it('should render `children`', () => {
      expect(wrapper).toRender(ChildComponent);
    });
  });

  describe('`of <ConfigureAdapter />`', () => {
    let configureAdapterWrapper;

    beforeEach(() => {
      configureAdapterWrapper = wrapper.find(ConfigureAdapter);
    });

    it('should receive `adapterArgs`', () => {
      expect(configureAdapterWrapper).toHaveProp(
        'adapterArgs',
        expect.objectContaining({})
      );
    });

    it('should receive `onStatusStateChange` and `onFlagsStateChange`', () => {
      expect(configureAdapterWrapper).toHaveProp('onStatusStateChange');
      expect(configureAdapterWrapper).toHaveProp('onFlagsStateChange');
    });

    it('should receive `defaultFlags`', () => {
      expect(configureAdapterWrapper).toHaveProp(
        'defaultFlags',
        Configure.defaultProps.defaultFlags
      );
    });
  });
});

describe('statics', () => {
  describe('displayName', () => {
    it('should be set to `ConfigureFlopflip`', () => {
      expect(Configure.displayName).toEqual('ConfigureFlopflip');
    });
  });

  describe('defaultProps', () => {
    it('should default `defaultFlags` to an empty object', () => {
      expect(Configure.defaultProps.defaultFlags).toEqual({});
    });

    it('should default `shouldDeferAdapterConfiguration` to `true`', () => {
      expect(Configure.defaultProps.shouldDeferAdapterConfiguration).toBe(
        false
      );
    });
  });
});
