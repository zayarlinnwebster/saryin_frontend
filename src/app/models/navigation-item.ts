import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: IconDefinition;
  hidden?: boolean;
  allowedUser?: string;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  badge?: {
    title?: string;
    type?: string;
  };
  fragment?: string;
  children?: NavigationItem[];
}
