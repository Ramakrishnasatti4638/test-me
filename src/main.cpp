#include <iostream>

int add(int a, int b); // forward decl, no header dependency

int main() {
    std::cout << "2 + 3 = " << add(2, 3) << "\n";
    return 0;
}
