import React, { useState, useCallback } from 'react';
import Tree from 'react-d3-tree';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

interface BranchNode {
  name: string;
  attributes?: {
    commit?: string;
    message?: string;
    timestamp?: string;
    type?: 'branch' | 'merge';
  };
  children?: BranchNode[];
}

interface BranchVisualizationProps {
  initialData?: BranchNode;
  interactive?: boolean;
}

const BranchVisualization: React.FC<BranchVisualizationProps> = ({
  initialData,
  interactive = false,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 200,
      });
      // Adjusted initial position
      setTranslate({
        x: 100, // Increased from 50 to 100 for better initial view
        y: containerRef.current.offsetHeight / 2,
      });
    }
  }, []);

  const getBranchColor = (branchName: string) => {
    if (branchName.includes('main')) {
      return '#2c3e50'; // Dark blue for main
    }
    if (branchName.includes('feat')) {
      return '#3498db'; // Light blue for feature
    }
    return '#2ecc71'; // Green for others
  };

  const getActionColor = (type?: string) => {
    switch (type) {
      case 'branch':
        return '#4CAF50'; // Green for branch
      case 'merge':
        return '#FF9800'; // Orange for merge
      default:
        return '#666';
    }
  };

  const renderForeignObjectNode = ({
    nodeDatum,
    foreignObjectProps,
  }: {
    nodeDatum: any;
    foreignObjectProps: any;
  }) => (
    <g>
      {/* Commit circle */}
      <circle
        r={8}
        fill="#4a4a4a"
        stroke="#fff"
        strokeWidth={2}
      />
      
      {/* Branch label - only show for first node in branch */}
      {(!nodeDatum.parent || nodeDatum.name !== nodeDatum.parent.name) && (
        <foreignObject
          x={-40}
          y={-30}
          width={80}
          height={20}
        >
          <Box
            sx={{
              backgroundColor: getBranchColor(nodeDatum.name),
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              textAlign: 'center',
              fontFamily: 'monospace',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {nodeDatum.name}
          </Box>
        </foreignObject>
      )}

      {/* Action label (branch/merge) */}
      {nodeDatum.attributes?.type && (
        <foreignObject
          x={20}
          y={-10}
          width={60}
          height={20}
        >
          <Box
            sx={{
              color: getActionColor(nodeDatum.attributes.type),
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontWeight: 'bold',
            }}
          >
            {nodeDatum.attributes.type}
          </Box>
        </foreignObject>
      )}
    </g>
  );

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3));
  const handleResetView = () => {
    setZoom(0.6);
    if (containerRef.current) {
      setTranslate({
        x: 100,
        y: containerRef.current.offsetHeight / 2,
      });
    }
  };

  return (
    <Paper
      ref={containerRef}
      sx={{
        width: '100%',
        height: 200,
        overflow: 'hidden',
        position: 'relative',
        mb: 2,
        backgroundColor: '#1a1a1a', // Dark background like in the image
      }}
    >
      {dimensions.width > 0 && (
        <>
          <Tree
            data={initialData || {
              name: 'main',
              children: [
                {
                  name: 'feat',
                  attributes: { type: 'branch' },
                  children: [
                    {
                      name: 'feat',
                      attributes: { type: 'merge' },
                    },
                  ],
                },
              ],
            }}
            orientation="horizontal"
            pathFunc="step"
            dimensions={dimensions}
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({
                ...rd3tProps,
                foreignObjectProps: {
                  width: 40,
                  height: 40,
                },
              })
            }
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            pathClassFunc={() => 'branch-path'}
          />
          {interactive && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Tooltip title="Zoom In" placement="left">
                <IconButton onClick={handleZoomIn} size="small" sx={{ color: '#fff' }}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out" placement="left">
                <IconButton onClick={handleZoomOut} size="small" sx={{ color: '#fff' }}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset View" placement="left">
                <IconButton onClick={handleResetView} size="small" sx={{ color: '#fff' }}>
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </>
      )}
      <style>
        {`
          .branch-path {
            stroke: #fff;
            stroke-width: 2;
          }
        `}
      </style>
    </Paper>
  );
};

export default BranchVisualization; 