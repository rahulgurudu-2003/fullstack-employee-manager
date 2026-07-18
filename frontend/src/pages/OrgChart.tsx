import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Network, 
  ChevronDown, 
  ChevronRight, 
  Briefcase, 
  Info,
  GitCommit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TreeNode {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  status: string;
  profileImage?: string;
  children: TreeNode[];
}

const OrgNode: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col relative pl-6 ml-2 border-l-2 border-gray-100 dark:border-dark-border py-1 select-none">
      <span className="absolute left-0 top-6 w-5 h-0.5 bg-gray-100 dark:bg-dark-border"></span>

      <div className="flex items-center justify-between bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-2xl p-4 shadow-sm transition-all w-full max-w-xl group">
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6 flex items-center justify-center text-gray-300 dark:text-gray-600">
              <GitCommit className="w-4 h-4" />
            </div>
          )}

          {node.profileImage ? (
            <img
              src={node.profileImage}
              alt={node.name}
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-500/10">
              {node.name.charAt(0)}
            </div>
          )}

          <div>
            <p className="font-bold text-gray-850 dark:text-gray-100 text-sm">{node.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>{node.designation}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-gray-350">{node.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChildren && (
            <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/20">
              {node.children.length} {node.children.length === 1 ? 'Reportee' : 'Reportees'}
            </span>
          )}

          <button
            onClick={() => navigate(`/profile?id=${node._id}`)}
            className="p-2 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition shadow-sm border border-gray-100/50 dark:border-transparent opacity-0 group-hover:opacity-100"
            title="View Profile Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <OrgNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChart: React.FC = () => {
  const { token } = useAuth();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch('/api/organization/tree', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setTreeData(result.data.tree);
        }
      } catch (err) {
        console.error('Failed to load org chart tree', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTree();
    }
  }, [token]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Organizational Hierarchy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Interactive reporting structure tree representation. Expand/collapse tree branches or search profile cards.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-8 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-gray-400">Constructing organization tree...</span>
          </div>
        ) : treeData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Network className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" />
            <p className="font-bold text-lg">Tree is Empty</p>
            <p className="text-sm mt-1">Ensure database is seeded with valid reporting relationships.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {treeData.map((rootNode) => (
              <div key={rootNode._id} className="relative py-2">
                <div className="absolute left-1 top-2.5 bg-blue-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide z-10 shadow-sm shadow-blue-500/10">
                  CEO / Root Node
                </div>
                <OrgNode node={rootNode} depth={0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;
