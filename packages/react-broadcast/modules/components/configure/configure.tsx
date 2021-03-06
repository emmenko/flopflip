import type { DeepReadonly } from 'ts-essentials';
import type {
  TAdapter,
  TFlags,
  TAdapterStatus,
  TFlagsChange,
  TAdapterStatusChange,
  TConfigureAdapterChildren,
  TConfigureAdapterProps,
} from '@flopflip/types';
import {
  TAdapterConfigurationStatus,
  TAdapterSubscriptionStatus,
} from '@flopflip/types';

import React from 'react';
import { ConfigureAdapter, useAdapterSubscription } from '@flopflip/react';
import { FlagsContext } from '../flags-context';

type BaseProps = {
  children?: TConfigureAdapterChildren;
  shouldDeferAdapterConfiguration?: boolean;
  defaultFlags?: TFlags;
};
type Props<AdapterInstance extends TAdapter> = BaseProps &
  TConfigureAdapterProps<AdapterInstance>;
type State = {
  flags: TFlags;
  status: TAdapterStatus;
  configurationId?: string;
};

const initialAdapterStatus: State['status'] = {
  subscriptionStatus: TAdapterSubscriptionStatus.Subscribed,
  configurationStatus: TAdapterConfigurationStatus.Unconfigured,
};
const initialFlags: State['flags'] = {};

type TUseFlagStateOptions = DeepReadonly<{
  initialFlags: State['flags'];
}>;
const useFlagsState = ({
  initialFlags,
}: TUseFlagStateOptions): [
  TFlags,
  React.Dispatch<React.SetStateAction<Readonly<TFlags>>>
] => {
  const [flags, setFlags] = React.useState<State['flags']>(initialFlags);

  return [flags, setFlags];
};

type TUseStatusStateOptions = DeepReadonly<{
  initialAdapterStatus: State['status'];
}>;
const useStatusState = ({
  initialAdapterStatus,
}: TUseStatusStateOptions): [
  TAdapterStatus,
  React.Dispatch<React.SetStateAction<Readonly<TAdapterStatus>>>
] => {
  const [status, setStatus] = React.useState<State['status']>(
    initialAdapterStatus
  );

  return [status, setStatus];
};

const Configure = <AdapterInstance extends TAdapter>(
  props: DeepReadonly<Props<AdapterInstance>>
) => {
  const [flags, setFlags] = useFlagsState({ initialFlags });
  const [status, setStatus] = useStatusState({ initialAdapterStatus });

  // NOTE:
  //   Using this prevents the callbacks being invoked
  //   which would trigger a setState as a result on an unmounted
  //   component.
  const getHasAdapterSubscriptionStatus = useAdapterSubscription(props.adapter);

  const handleUpdateFlags = React.useCallback<
    (flags: Readonly<TFlagsChange>) => void
  >(
    (flags) => {
      if (
        getHasAdapterSubscriptionStatus(TAdapterSubscriptionStatus.Unsubscribed)
      ) {
        return;
      }

      setFlags((prevFlags) => ({
        ...prevFlags,
        ...flags,
      }));
    },
    [setFlags, getHasAdapterSubscriptionStatus]
  );

  const handleUpdateStatus = React.useCallback<
    (status: Readonly<TAdapterStatusChange>) => void
  >(
    (status) => {
      if (
        getHasAdapterSubscriptionStatus(TAdapterSubscriptionStatus.Unsubscribed)
      ) {
        return;
      }

      setStatus((prevStatus) => ({
        ...prevStatus,
        ...status,
      }));
    },
    [setStatus, getHasAdapterSubscriptionStatus]
  );

  return (
    <FlagsContext.Provider value={flags}>
      <ConfigureAdapter
        adapter={props.adapter}
        adapterArgs={props.adapterArgs}
        adapterStatus={status}
        defaultFlags={props.defaultFlags}
        shouldDeferAdapterConfiguration={props.shouldDeferAdapterConfiguration}
        onFlagsStateChange={handleUpdateFlags}
        onStatusStateChange={handleUpdateStatus}
      >
        {props.children}
      </ConfigureAdapter>
    </FlagsContext.Provider>
  );
};

Configure.displayName = 'ConfigureFlopflip';
Configure.defaultProps = {
  defaultFlags: {},
  shouldDeferAdapterConfiguration: false,
};

export default Configure;
