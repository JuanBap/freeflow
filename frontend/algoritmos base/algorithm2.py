import copy
from collections import defaultdict

def find_solution(board):
    n = len(board)
    # Find pairs of points (by number/color)
    pairs = defaultdict(list)
    for i in range(n):
        for j in range(n):
            if board[i][j] != 0:
                pairs[board[i][j]].append((i, j))
    
    # Convert pairs to list for ordered processing
    pairs_list = [(color, pair[0], pair[1]) for color, pair in pairs.items() if len(pair) == 2]
    if not pairs_list:
        return None  # No valid pairs found
    
    def is_valid_move(x, y, board, visited):
        return (0 <= x < n and 0 <= y < n and 
                (x, y) not in visited and 
                (board[x][y] == 0 or (x, y) in [pairs[color][1] for color, _, _ in pairs_list]))

    def solve(board, pair_index, visited):
        if pair_index == len(pairs_list):
            # Check if board is fully filled
            return board if len(visited) == n * n else None
        
        color, (x1, y1), (x2, y2) = pairs_list[pair_index]
        
        def dfs(x, y, path, visited):
            if (x, y) == (x2, y2):
                # Reached the target point
                new_board = copy.deepcopy(board)
                for px, py in path:
                    if new_board[px][py] == 0:
                        new_board[px][py] = color
                # Try solving for next pair
                result = solve(new_board, pair_index + 1, visited | set(path))
                if result:
                    return result
                return None
            
            # Try all four directions
            directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Up, down, left, right
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if is_valid_move(nx, ny, board, visited):
                    new_path = path + [(nx, ny)]
                    new_visited = visited | {(nx, ny)}
                    result = dfs(nx, ny, new_path, new_visited)
                    if result:
                        return result
            return None
        
        # Start DFS from the first point of the current pair
        return dfs(x1, y1, [(x1, y1)], {(x1, y1)})

    # Start solving from the first pair
    result = solve(board, 0, set())
    return result if result else "No solution exists"

# Create board from input
def create_board(input_data):
    lines = input_data.strip().split('\n')
    # Parse board size
    n, _ = map(int, lines[0].split(','))
    # Initialize empty board
    board = [[0] * n for _ in range(n)]
    # Place pairs
    for line in lines[1:]:
        row, col, num = map(int, line.split(','))
        # Convert 1-based to 0-based indexing
        board[row - 1][col - 1] = num
    return board

# Print board utility
def print_board(board):
    if isinstance(board, str):
        print(board)
    else:
        for row in board:
            print(' '.join(str(cell).rjust(2) for cell in row))
        print()

# Input data
input_data = """7,7
1,5,1
6,6,1
1,6,2
7,4,2
2,3,3
5,3,3
2,6,4
5,6,4
2,2,5
6,2,5"""

# Create and solve board
board = create_board(input_data)
print("Input board:")
print_board(board)
print("Solution:")
print_board(find_solution(board))
