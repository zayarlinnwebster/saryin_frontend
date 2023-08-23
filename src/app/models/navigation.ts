import { NavigationItem } from "./navigation-item";

export interface Navigation extends NavigationItem {
    children?: NavigationItem[];
}
