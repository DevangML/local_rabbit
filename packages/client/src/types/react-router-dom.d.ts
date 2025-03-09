import * as React from 'react';
import { 
  RouteProps as OriginalRouteProps, 
  RoutesProps as OriginalRoutesProps,
  Route as OriginalRoute,
  Routes as OriginalRoutes,
  RouterProviderProps,
  OutletProps
} from 'react-router-dom';

declare module 'react-router-dom' {
  // Override the Route component type
  export const Route: React.FC<OriginalRouteProps>;
  
  // Override the Routes component type
  export const Routes: React.FC<OriginalRoutesProps>;
  
  // Override the RouterProvider component type
  export const RouterProvider: React.FC<RouterProviderProps>;
  
  // Override the Outlet component type
  export const Outlet: React.FC<OutletProps>;
}

declare module 'react-router-dom/server' {
  // Override the StaticRouterProvider component type
  export const StaticRouterProvider: React.FC<any>;
} 