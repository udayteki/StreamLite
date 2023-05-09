import React, { FC } from 'react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Box,
  Button,
  Input,
  Link,
  Icon,
  ListItem,
  Text,
} from 'components/kit_v2';

import { TopBar } from 'config/stitches/foundations/layout';

import Board from 'pages/Board/Board';

import useApp from './useApp';
import {
  AppWrapper,
  BoardSection,
  BrowseSection,
  BoardWrapper,
} from './App.style';

interface FileListProps {
  filesList: string[];
  onFileClick: (file: string) => void;
}

const FileList: FC<FileListProps> = ({ filesList, onFileClick }) => {
  return (
    <div>
      {filesList.map((file: string, index: number) => (
        <ListItem key={index} onClick={() => onFileClick(file)}>
          {file}
        </ListItem>
      ))}
    </div>
  );
};

interface BoardRendererProps {
  board: any;
  data: any;
}

const BoardRenderer: FC<BoardRendererProps> = ({ board, data }) => {
  // console.log(board, data);
  const code = data.files_contents[board.path];
  // console.log(code);
  const lines = code.split('\n');
  const embedPattern = /BoardEmbed\(["|'](.*)["|']\)\n*$/;
  const linkPattern = /BoardLink\(["|'](.*)["|']\)\n*$/;
  const replacedLines = lines.map((line: string) => {
    // Replace embeds
    const embedMatch = line.match(embedPattern);
    if (embedMatch) {
      // console.log(embedMatch);
      const filePath = embedMatch[1].replace(/\./g, '/') + '.py';
      const relPath = filePath
        .replace(new RegExp(`^${data.app_dir_name}/?`), '')
        .trim();
      try {
        return data.files_contents[relPath];
      } catch (error) {
        return line;
      }
    }
    // Replace links
    const linkMatch = line.match(linkPattern);
    if (linkMatch) {
      // console.log(linkMatch);
      const filePath = linkMatch[1].replace(/\./g, '/') + '.py';
      const relPath = filePath
        .replace(new RegExp(`^${data.app_dir_name}/?`), '')
        .trim();
      return `BoardLink("${relPath}")`;
    }
    return line;
  });
  const fullCode = replacedLines.join('\n');
  // console.log(fullCode);
  return (
    <BoardWrapper>
      <Board
        key={board.path}
        data={{
          code: fullCode,
        }}
        editMode={false}
        previewMode
      />
    </BoardWrapper>
  );
};

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, board, isLoading, handleFileClick } = useApp();
  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>APP</Text>
      </TopBar>
      {isLoading ? (
        <>
          <p>Loading...</p>
        </>
      ) : (
        <AppWrapper>
          <BoardSection>
            {!!board?.path ? (
              <BoardRenderer board={board} data={data} />
            ) : (
              <Text size='$3'>Select the board</Text>
            )}
          </BoardSection>
          <BrowseSection>
            <Text color='$textPrimary' size='$3' weight='$2'>
              Browse:
            </Text>
            <FileList filesList={data.files} onFileClick={handleFileClick} />
          </BrowseSection>
        </AppWrapper>
      )}
    </ErrorBoundary>
  );
}

export default App;
