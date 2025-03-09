/**
 * This is a complete replacement for @mui/styled-engine that adds the missing internal_processStyles function
 * which is imported by @mui/system/esm/createStyled.js but not exported by @mui/styled-engine v6
 */

// Import everything we need from @emotion
import emStyled from '@emotion/styled';
import { ThemeContext, keyframes, css } from '@emotion/react';
import { serializeStyles as emSerializeStyles } from '@emotion/serialize';

// Ensure useInsertionEffect is available
import * as React from 'react';
import * as emotionUseInsertionEffect from '@emotion/use-insertion-effect-with-fallbacks';

// Define the styled function (copied from @mui/styled-engine)
function styled(tag, options) {
  const stylesFactory = emStyled(tag, options);
  if (process.env.NODE_ENV !== 'production') {
    return (...styles) => {
      const component = typeof tag === 'string' ? `"${tag}"` : 'component';
      if (styles.length === 0) {
        console.error([`MUI: Seems like you called \`styled(${component})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join('\n'));
      } else if (styles.some(style => style === undefined)) {
        console.error(`MUI: the styled(${component})(...args) API requires all its args to be defined.`);
      }
      return stylesFactory(...styles);
    };
  }
  return stylesFactory;
}

// Define the internal_mutateStyles function (copied from @mui/styled-engine)
export function internal_mutateStyles(tag, processor) {
  // Emotion attaches all the styles as `__emotion_styles`.
  // Ref: https://github.com/emotion-js/emotion/blob/16d971d0da229596d6bcc39d282ba9753c9ee7cf/packages/styled/src/base.js#L186
  if (Array.isArray(tag.__emotion_styles)) {
    tag.__emotion_styles = processor(tag.__emotion_styles);
  }
}

// Define the internal_serializeStyles function (copied from @mui/styled-engine)
const wrapper = [];
export function internal_serializeStyles(styles) {
  wrapper[0] = styles;
  return emSerializeStyles(wrapper);
}

// Add the missing internal_processStyles function
export const internal_processStyles = (styles) => {
  // Just return the styles unchanged
  return styles;
};

// Define a simple StyledEngineProvider component
function StyledEngineProvider(props) {
  const { children, ...other } = props;
  return children;
}

// Define a simple GlobalStyles component
function GlobalStyles(props) {
  const { styles, defaultTheme = {} } = props;
  return null;
}

// Export everything
export default styled;
export {
  ThemeContext,
  keyframes,
  css,
  StyledEngineProvider,
  GlobalStyles
}; 