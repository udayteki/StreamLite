import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

import { Box } from '../../components/kit_v2';

const AppWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
});

const BoardSection = styled('div', {
  flexGrow: 1,
  minHeight: 0,
  p: '$4',
});

const BrowseSection = styled('div', {
  width: '250px',
  minHeight: 0, // to ensure the section respects its parent's height
  borderLeft: '1px solid #B5C4D3',
  p: '$4',
});

const BoardWrapper = styled('div', {});

// const AppContainer = styled(LayoutContainer, {
//   $$space: '$space$15',
//   py: '$$space',
//   overflowY: 'auto',
//   height: 'calc(100vh - $$space)',
// });
//
// const BoardContainer = styled(Box, {
//   mb: '$6',
// });
//
// const BoardWrapper = styled(Box, {
//   border: '1px solid #B5C4D3',
//   p: '$4',
//   mt: '$4',
// });

export { AppWrapper, BoardSection, BrowseSection, BoardWrapper };
