import { RouteComponentProps } from 'wouter';

export const PluginPage = ({ params }: RouteComponentProps) => {
  const pluginName = params.plugin;
  return (
        <div>
            {pluginName}
        </div>
  );
};
