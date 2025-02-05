export type RouteType = {
    route: string;
    title: string;
    template: string;
    navTemplate?: string;
    navBar: boolean;
    load: () => void;
};