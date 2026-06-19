/**
 * Code Wrapper Service for AlgoArmy
 * Wraps LeetCode-style class/function solutions into complete executable files for Judge0 CE.
 */

// Simple helper to parse signatures of C++, Java, Python, and JavaScript code.
export const extractMetadata = (starterCode, language) => {
  if (!starterCode) return null;

  try {
    const code = starterCode.toString();
    
    // 1. Python Signature Parser
    if (language.toLowerCase() === 'python' || language.toLowerCase() === 'python3') {
      // e.g. def twoSum(self, nums: List[int], target: int) -> List[int]:
      const defRegex = /def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/;
      const match = code.match(defRegex);
      if (match) {
        const functionName = match[1];
        const paramsRaw = match[2];
        const returnType = (match[3] || 'None').trim();
        
        const parameters = [];
        paramsRaw.split(',').forEach(p => {
          const parts = p.trim().split(':');
          if (parts.length === 2) {
            const name = parts[0].trim();
            const type = parts[1].trim();
            if (name !== 'self') {
              parameters.push({ type, name });
            }
          } else {
            const name = p.trim();
            if (name && name !== 'self') {
              parameters.push({ type: 'any', name });
            }
          }
        });
        
        return { functionName, returnType, parameters };
      }
    }

    // 2. C++ / Java / JS Parser
    // C++ / Java often looks like:
    // int sum(int num1, int num2) { ... }
    // vector<int> twoSum(vector<int>& nums, int target) { ... }
    // public int[] twoSum(int[] nums, int target) { ... }
    const cppJavaRegex = /(?:public|private|protected|static|\s)*([\w<>[\]:&]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/;
    const cppJavaMatch = code.match(cppJavaRegex);
    if (cppJavaMatch) {
      const returnType = cppJavaMatch[1].trim();
      const functionName = cppJavaMatch[2].trim();
      const paramsRaw = cppJavaMatch[3];
      
      const parameters = [];
      paramsRaw.split(',').forEach(p => {
        const trimmed = p.trim();
        if (!trimmed) return;
        // Last word is parameter name, preceding is type (possibly with & or *)
        const words = trimmed.split(/\s+/);
        if (words.length >= 2) {
          const name = words[words.length - 1].replace(/[&*]/g, '').trim();
          const type = words.slice(0, words.length - 1).join(' ').trim();
          parameters.push({ type, name });
        }
      });
      
      if (functionName && functionName !== 'Solution') {
        return { functionName, returnType, parameters };
      }
    }

    // 3. JavaScript Parser
    // var twoSum = function(nums, target) { ... }
    // const twoSum = (nums, target) => { ... }
    // function twoSum(nums, target) { ... }
    const jsRegex1 = /(?:var|const|let)\s+(\w+)\s*=\s*function\s*\(([^)]*)\)/;
    const jsRegex2 = /function\s+(\w+)\s*\(([^)]*)\)/;
    const jsRegex3 = /(?:var|const|let)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/;
    
    const jsMatch = code.match(jsRegex1) || code.match(jsRegex2) || code.match(jsRegex3);
    if (jsMatch) {
      const functionName = jsMatch[1].trim();
      const paramsRaw = jsMatch[2];
      const parameters = paramsRaw.split(',').map(p => ({
        type: 'any',
        name: p.trim()
      })).filter(p => p.name);
      
      return {
        functionName,
        returnType: 'any',
        parameters
      };
    }
  } catch (e) {
    console.error('[WrapperService] Error extracting metadata:', e.message);
  }

  // Fallback
  return null;
};

/**
 * C++ Code Wrapper
 */
export const generateCppWrapper = (userCode, metadata, stdin) => {
  const { functionName, returnType, parameters } = metadata;

  // Let's create type conversion helpers for C++
  let mainHelpers = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>

using namespace std;

// Definitions for LeetCode common types
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

// Helper parsers
vector<int> parseVectorInt(string str) {
    vector<int> res;
    // Remove brackets
    str.erase(remove(str.begin(), str.end(), '['), str.end());
    str.erase(remove(str.begin(), str.end(), ']'), str.end());
    str.erase(remove(str.begin(), str.end(), ' '), str.end());
    if (str.empty()) return res;
    stringstream ss(str);
    string item;
    while (getline(ss, item, ',')) {
        if (!item.empty()) res.push_back(stoi(item));
    }
    return res;
}

vector<string> parseVectorString(string str) {
    vector<string> res;
    str.erase(remove(str.begin(), str.end(), '['), str.end());
    str.erase(remove(str.begin(), str.end(), ']'), str.end());
    if (str.empty()) return res;
    stringstream ss(str);
    string item;
    while (getline(ss, item, ',')) {
        // Strip quotes
        if (item.front() == '"' || item.front() == '\\\'') item.erase(0, 1);
        if (item.back() == '"' || item.back() == '\\\'') item.pop_back();
        res.push_back(item);
    }
    return res;
}

ListNode* parseListNode(string str) {
    vector<int> vals = parseVectorInt(str);
    if (vals.empty()) return nullptr;
    ListNode* head = new ListNode(vals[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < vals.size(); ++i) {
        curr->next = new ListNode(vals[i]);
        curr = curr->next;
    }
    return head;
}

void printResult(int val) { cout << val; }
void printResult(long val) { cout << val; }
void printResult(long long val) { cout << val; }
void printResult(double val) { cout << val; }
void printResult(float val) { cout << val; }
void printResult(bool val) { cout << (val ? "true" : "false"); }
void printResult(const string& val) { cout << val; }

void printVectorOrElement(int val) { cout << val; }
void printVectorOrElement(long val) { cout << val; }
void printVectorOrElement(long long val) { cout << val; }
void printVectorOrElement(double val) { cout << val; }
void printVectorOrElement(float val) { cout << val; }
void printVectorOrElement(bool val) { cout << (val ? "true" : "false"); }
void printVectorOrElement(const string& val) { cout << "\\"" << val << "\\""; }

// Forward declarations and template implementations for vectors
template<typename T>
void printVector(const vector<T>& vec);

template<typename T>
void printVectorOrElement(const vector<T>& vec) {
    printVector(vec);
}

template<typename T>
void printVector(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        printVectorOrElement(vec[i]);
        if (i + 1 < vec.size()) cout << ",";
    }
    cout << "]";
}

void printListNode(ListNode* head) {
    cout << "[";
    ListNode* curr = head;
    while (curr) {
        cout << curr->val;
        if (curr->next) cout << ",";
        curr = curr->next;
    }
    cout << "]";
}

void printResult(TreeNode* root) {
    if (!root) {
        cout << "null";
        return;
    }
    cout << root->val;
}
void printVectorOrElement(TreeNode* root) {
    printResult(root);
}

void printResult(ListNode* head) {
    printListNode(head);
}
void printVectorOrElement(ListNode* head) {
    printListNode(head);
}

// Tree parser for BFS string inputs (e.g. "[1,null,2,3]")
TreeNode* parseTreeNode(string str) {
    str.erase(remove(str.begin(), str.end(), '['), str.end());
    str.erase(remove(str.begin(), str.end(), ']'), str.end());
    str.erase(remove(str.begin(), str.end(), ' '), str.end());
    if (str.empty()) return nullptr;
    stringstream ss(str);
    string item;
    vector<string> items;
    while (getline(ss, item, ',')) {
        items.push_back(item);
    }
    if (items.empty() || items[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(items[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < items.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < items.size() && items[i] != "null") {
            curr->left = new TreeNode(stoi(items[i]));
            q.push(curr->left);
        }
        i++;
        if (i < items.size() && items[i] != "null") {
            curr->right = new TreeNode(stoi(items[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}
  `;

  // Generate input reading inside main
  let paramDeclarations = '';
  let paramParsers = '';
  let callArgs = [];

  parameters.forEach((param, index) => {
    const pType = param.type.trim();
    const pName = param.name.trim();
    callArgs.push(pName);

    paramDeclarations += `    string raw_${pName};\n    getline(cin, raw_${pName});\n`;

    if (pType.includes('vector<int>') || pType.includes('int[]')) {
      paramParsers += `    vector<int> ${pName} = parseVectorInt(raw_${pName});\n`;
    } else if (pType.includes('vector<string>') || pType.includes('string[]')) {
      paramParsers += `    vector<string> ${pName} = parseVectorString(raw_${pName});\n`;
    } else if (pType.includes('ListNode')) {
      paramParsers += `    ListNode* ${pName} = parseListNode(raw_${pName});\n`;
    } else if (pType.includes('TreeNode')) {
      paramParsers += `    TreeNode* ${pName} = parseTreeNode(raw_${pName});\n`;
    } else if (pType === 'int') {
      paramParsers += `    int ${pName} = stoi(raw_${pName});\n`;
    } else if (pType === 'double' || pType === 'float') {
      paramParsers += `    double ${pName} = stod(raw_${pName});\n`;
    } else if (pType === 'bool' || pType === 'boolean') {
      paramParsers += `    bool ${pName} = (raw_${pName} == "true" || raw_${pName} == "1");\n`;
    } else {
      paramParsers += `    string ${pName} = raw_${pName};\n`;
    }
  });

  let outputPrinter = '';
  const ret = returnType.trim();
  if (ret.includes('ListNode')) {
    outputPrinter = `    printListNode(res);\n`;
  } else if (ret.includes('vector') || ret.includes('[]')) {
    outputPrinter = `    printVector(res);\n`;
  } else {
    outputPrinter = `    printResult(res);\n`;
  }

  const generatedMain = `
int main() {
    Solution solver;
${paramDeclarations}
${paramParsers}
    auto res = solver.${functionName}(${callArgs.join(', ')});
${outputPrinter}
    return 0;
}
  `;

  return `${mainHelpers}\n\n${userCode}\n\n${generatedMain}`;
};

/**
 * Java Code Wrapper
 */
export const generateJavaWrapper = (userCode, metadata, stdin) => {
  const { functionName, returnType, parameters } = metadata;

  let paramDeclarations = '';
  let paramParsers = '';
  let callArgs = [];

  parameters.forEach((param, index) => {
    const pType = param.type.trim();
    const pName = param.name.trim();
    callArgs.push(pName);

    paramDeclarations += `        String raw_${pName} = sc.hasNextLine() ? sc.nextLine().trim() : "";\n`;

    if (pType.includes('int[]') || pType.includes('List<Integer>') || pType.toLowerCase().includes('vector')) {
      paramParsers += `        int[] ${pName} = parseVectorInt(raw_${pName});\n`;
    } else if (pType.includes('String[]') || pType.includes('List<String>')) {
      paramParsers += `        String[] ${pName} = parseVectorString(raw_${pName});\n`;
    } else if (pType.includes('ListNode')) {
      paramParsers += `        ListNode ${pName} = parseListNode(raw_${pName});\n`;
    } else if (pType.includes('TreeNode')) {
      paramParsers += `        TreeNode ${pName} = parseTreeNode(raw_${pName});\n`;
    } else if (pType.equals?.('int') || pType === 'int' || pType === 'Integer') {
      paramParsers += `        int ${pName} = Integer.parseInt(raw_${pName});\n`;
    } else if (pType === 'double' || pType === 'float' || pType === 'Double') {
      paramParsers += `        double ${pName} = Double.parseDouble(raw_${pName});\n`;
    } else if (pType === 'boolean' || pType === 'Boolean') {
      paramParsers += `        boolean ${pName} = raw_${pName}.equals("true") || raw_${pName}.equals("1");\n`;
    } else {
      paramParsers += `        String ${pName} = raw_${pName};\n`;
    }
  });

  let outputPrinter = '';
  const ret = returnType.trim();
  if (ret.equals?.('String') || ret === 'String') {
    outputPrinter = `        System.out.print(res);`;
  } else {
    outputPrinter = `        System.out.print(serialize(res));`;
  }

  // Java wrapper wraps User Solution inside a Main class
  return `
import java.util.*;

// LeetCode common types
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

\n${userCode}\n

public class Main {
    private static int[] parseVectorInt(String str) {
        str = str.replace("[", "").replace("]", "").replace(" ", "");
        if (str.isEmpty()) return new int[0];
        String[] parts = str.split(",");
        int[] res = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Integer.parseInt(parts[i]);
        }
        return res;
    }

    private static String[] parseVectorString(String str) {
        str = str.replace("[", "").replace("]", "");
        if (str.isEmpty()) return new String[0];
        String[] parts = str.split(",");
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim().replace("\\"", "").replace("'", "");
        }
        return parts;
    }

    private static ListNode parseListNode(String str) {
        int[] vals = parseVectorInt(str);
        if (vals.length == 0) return null;
        ListNode head = new ListNode(vals[0]);
        ListNode curr = head;
        for (int i = 1; i < vals.length; i++) {
            curr.next = new ListNode(vals[i]);
            curr = curr.next;
        }
        return head;
    }

    private static void printListNode(ListNode head) {
        System.out.print("[");
        ListNode curr = head;
        while (curr != null) {
            System.out.print(curr.val);
            if (curr.next != null) System.out.print(",");
            curr = curr.next;
        }
        System.out.print("]");
    }

    private static TreeNode parseTreeNode(String str) {
        str = str.replace("[", "").replace("]", "").replace(" ", "");
        if (str.isEmpty()) return null;
        String[] parts = str.split(",");
        if (parts.length == 0 || parts[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(parts[0]));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < parts.length) {
            TreeNode curr = q.poll();
            if (i < parts.length && !parts[i].equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(parts[i]));
                q.add(curr.left);
            }
            i++;
            if (i < parts.length && !parts[i].equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(parts[i]));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    private static String serialize(Object obj) {
        if (obj == null) {
            return "null";
        }
        if (obj instanceof ListNode) {
            StringBuilder sb = new StringBuilder();
            sb.append("[");
            ListNode curr = (ListNode) obj;
            while (curr != null) {
                sb.append(curr.val);
                if (curr.next != null) sb.append(",");
                curr = curr.next;
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof TreeNode) {
            return String.valueOf(((TreeNode) obj).val);
        }
        if (obj instanceof String || obj instanceof Character) {
            return "\\"" + obj + "\\"";
        }
        if (obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof Number) {
            return obj.toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder();
            sb.append("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append(serialize(list.get(i)));
                if (i + 1 < list.size()) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj.getClass().isArray()) {
            StringBuilder sb = new StringBuilder();
            sb.append("[");
            int length = java.lang.reflect.Array.getLength(obj);
            for (int i = 0; i < length; i++) {
                sb.append(serialize(java.lang.reflect.Array.get(obj, i)));
                if (i + 1 < length) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution solver = new Solution();
${paramDeclarations}
${paramParsers}
        var res = solver.${functionName}(${callArgs.join(', ')});
${outputPrinter}
    }
}
  `;
};

/**
 * Python Code Wrapper
 */
export const generatePythonWrapper = (userCode, metadata, stdin) => {
  const { functionName, returnType, parameters } = metadata;

  // Let's create type conversion helpers for Python
  let header = `
import sys
import json
from typing import List, Optional

# LeetCode Common Types
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class LeetCodeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ListNode):
            res = []
            curr = obj
            while curr:
                res.append(curr.val)
                curr = curr.next
            return res
        if isinstance(obj, TreeNode):
            return obj.val
        return super().default(obj)

def parse_list_node(val_str):
    vals = json.loads(val_str) if val_str.strip() else []
    if not vals:
        return None
    head = ListNode(vals[0])
    curr = head
    for v in vals[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head

def print_list_node(head):
    res = []
    curr = head
    while curr:
        res.append(curr.val)
        curr = curr.next
    return json.dumps(res, separators=(',', ':'))

def parse_tree_node(val_str):
    str_clean = val_str.strip().replace('[', '').replace(']', '').replace(' ', '')
    if not str_clean:
        return None
    parts = str_clean.split(',')
    if not parts or parts[0] == "null" or parts[0] == "":
        return None
    root = TreeNode(int(parts[0]))
    q = [root]
    i = 1
    while q and i < len(parts):
        curr = q.pop(0)
        if i < len(parts) and parts[i] != "null":
            curr.left = TreeNode(int(parts[i]))
            q.append(curr.left)
        i += 1
        if i < len(parts) and parts[i] != "null":
            curr.right = TreeNode(int(parts[i]))
            q.append(curr.right)
        i += 1
    return root

def parse_input(t, val_str):
    val_str = val_str.strip()
    if not val_str:
        return None
    t_lower = t.lower()
    if 'listnode' in t_lower:
        return parse_list_node(val_str)
    if 'treenode' in t_lower:
        return parse_tree_node(val_str)
    if 'list' in t_lower or '[]' in t_lower or 'vector' in t_lower:
        return json.loads(val_str)
    if 'int' in t_lower:
        return int(val_str)
    if 'float' in t_lower or 'double' in t_lower:
        return float(val_str)
    if 'bool' in t_lower:
        return val_str.lower() in ('true', '1')
    if 'str' in t_lower:
        if (val_str.startswith('"') and val_str.endswith('"')) or (val_str.startswith("'") and val_str.endswith("'")):
            return val_str[1:-1]
        return val_str
    # Fallback
    try:
        return json.loads(val_str)
    except:
        return val_str
  `;

  let paramParsers = '';
  let callArgs = [];

  parameters.forEach((param, index) => {
    const pType = param.type.trim();
    const pName = param.name.trim();
    callArgs.push(pName);

    paramParsers += `    ${pName} = parse_input("${pType}", raw_lines[${index}] if ${index} < len(raw_lines) else "")\n`;
  });

  let outputPrinter = `
    if isinstance(res, ListNode):
        print(print_list_node(res), end="")
    elif isinstance(res, (list, dict, bool)):
        print(json.dumps(res, cls=LeetCodeEncoder, separators=(',', ':')), end="")
    else:
        print(res, end="")
  `;

  return `
${header}

${userCode}

if __name__ == '__main__':
    raw_lines = sys.stdin.read().splitlines()
    # Filter out empty lines if they don't represent arguments (but keep empty arrays/strings)
    raw_lines = [l for l in raw_lines if l.strip() != '']
    
    solver = Solution()
${paramParsers}
    res = solver.${functionName}(${callArgs.join(', ')})
${outputPrinter}
  `;
};

/**
 * JavaScript Code Wrapper
 */
export const generateJavascriptWrapper = (userCode, metadata, stdin) => {
  const { functionName, returnType, parameters } = metadata;

  let header = `
const fs = require('fs');

class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
    toJSON() {
        const res = [];
        let curr = this;
        while (curr) {
            res.push(curr.val);
            curr = curr.next;
        }
        return res;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
    toJSON() {
        return this.val;
    }
}

function parseListNode(str) {
    const vals = JSON.parse(str || "[]");
    if (vals.length === 0) return null;
    const head = new ListNode(vals[0]);
    let curr = head;
    for (let i = 1; i < vals.length; i++) {
        curr.next = new ListNode(vals[i]);
        curr = curr.next;
    }
    return head;
}

function printListNode(head) {
    const res = [];
    let curr = head;
    while (curr) {
        res.push(curr.val);
        curr = curr.next;
    }
    return JSON.stringify(res);
}

function parseTreeNode(str) {
    const clean = str.replace(/[\\\[\\\]\\s]/g, "");
    if (!clean) return null;
    const parts = clean.split(",");
    if (parts.length === 0 || parts[0] === "null" || parts[0] === "") return null;
    const root = new TreeNode(parseInt(parts[0], 10));
    const q = [root];
    let i = 1;
    while (q.length > 0 && i < parts.length) {
        const curr = q.shift();
        if (i < parts.length && parts[i] !== "null") {
            curr.left = new TreeNode(parseInt(parts[i], 10));
            q.push(curr.left);
        }
        i++;
        if (i < parts.length && parts[i] !== "null") {
            curr.right = new TreeNode(parseInt(parts[i], 10));
            q.push(curr.right);
        }
        i++;
    }
    return root;
}

function parseInput(type, valStr) {
    valStr = valStr.trim();
    if (!valStr) return null;
    const tLower = type.toLowerCase();
    if (tLower.includes('listnode')) {
        return parseListNode(valStr);
    }
    if (tLower.includes('treenode')) {
        return parseTreeNode(valStr);
    }
    if (tLower.includes('list') || tLower.includes('[]') || valStr.startsWith('[')) {
        return JSON.parse(valStr);
    }
    if (tLower.includes('int') || tLower.includes('number') || tLower.includes('double')) {
        return Number(valStr);
    }
    if (tLower.includes('bool') || tLower.includes('boolean')) {
        return valStr === 'true' || valStr === '1';
    }
    if (tLower.includes('str')) {
        if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
            return valStr.substring(1, valStr.length - 1);
        }
        return valStr;
    }
    try {
        return JSON.parse(valStr);
    } catch (e) {
        return valStr;
    }
}
  `;

  let paramParsers = '';
  let callArgs = [];

  parameters.forEach((param, index) => {
    const pType = param.type.trim();
    const pName = param.name.trim();
    callArgs.push(pName);

    paramParsers += `    const ${pName} = parseInput("${pType}", rawLines[${index}] || "");\n`;
  });

  let outputPrinter = `
    if (res instanceof ListNode) {
        process.stdout.write(printListNode(res));
    } else if (typeof res === 'object' && res !== null) {
        process.stdout.write(JSON.stringify(res));
    } else if (typeof res === 'boolean') {
        process.stdout.write(res ? "true" : "false");
    } else {
        process.stdout.write(String(res));
    }
  `;

  return `
${header}

${userCode}

function main() {
    const rawInput = fs.readFileSync(0, 'utf-8');
    const rawLines = rawInput.split(/\\r?\\n/).map(l => l.trim()).filter(l => l !== "");
    
    // LeetCode JS solutions usually instantiate Solution class, or export it
    // Let's support both var sum = function... and class Solution
    let solver;
    if (typeof Solution !== 'undefined') {
        solver = new Solution();
    } else {
        // Fallback: If no class Solution but function is global
        solver = {
            ${functionName}: typeof ${functionName} !== 'undefined' ? ${functionName} : null
        };
    }

${paramParsers}
    const res = solver.${functionName}(${callArgs.join(', ')});
${outputPrinter}
}

main();
  `;
};
