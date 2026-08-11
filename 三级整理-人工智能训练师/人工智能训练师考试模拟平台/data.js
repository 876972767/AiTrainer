var data = [
  {
    id: "1",
    firstName: "业务分析",
    questions: [
      {
        id: "1.2.1",
        question:
          "在某电商平台的顾客评价情感识别中，用户反映的主要问题包括：情感识别准确性不高，导致分析结果偏差；响应速度慢，用户需长时间等待识别结果；用户界面不友好，操作复杂；缺乏定制化服务，无法满足特定需求。这些问题影响了用户的购物体验和满意度，需进行优化。",
        todo: [
          {
            type: "text",
            questionTitle:
              "（1）请列举顾客评价情感识别业务模块中用户反映最强烈的两个问题，并解释这两个问题为什么会让用户感到不满，影响他们的使用体验。\n将上述答案写在 1.2.1.docx 答题卷上，题号为“ 1.2.1-1 ”。\n（2）请设计一个优化顾客评价情感识别业务模块的方案，包括关键的实施步骤和你期望的优化效果。要求方案具体、可行，能够有效提升用户体验和服务质量。\n将上述答案写在 1.2.1.docx 答题卷上，题号为“ 1.2.1-2 ”。",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    firstName: "智能训练",
    questions: [
      {
        id: "2.1.1",
        question:
          "在现代交通中，燃油效率（MPG）是衡量汽车性能和交通系统优化的重要指标之一。高效的燃油利用不仅能够降低车辆运营成本，还能减少碳排放，促进环保。开发一个用于预测汽车燃油效率的模型可以帮助智慧交通系统优化路线规划和车辆调度，从而提升整体交通效率和减少能源消耗。此外，这样的模型还可以帮助消费者做出更明智的购车决策，并帮助厂商优化汽车设计。现要求根据提供的汽车燃油效率数据集，补全 2.1.1.ipynb 代码。选择合适的特征，开发一个燃油效率预测模型。在开发预测模型之前，首先要对数据进行数据清洗和标注，请完成下面的数据预处理任务，并设计一套标注流程规范：",
        todo: [
          {
            type: "code",
            questionTitle:
              "(1)正确加载数据集，并显示前五行的数据及数据类型。\n(2)检查数据集中的缺失值并删除缺失值所在的行。\n(3)将“horsepower ”列转换为数值类型，并处理转换中的异常值。\n(4)对数值型数据进行标准化处理，确保数据在同一量纲下进行分析。\n(5)根据业务需求和数据特性 ，选择对燃油效率预测最有用的特征： 选择以下特征： 'cylinders'、'displacement'、'horsepower'、'weight'、'acceleration'、'model year'、 'origin'\n(6)将“mpg ”设为目标变量并标注；\n(7)对数据进行标注和划分；\n(8)保存处理后的数据，并命名为：2.1.1_cleaned_data.csv，保存到考生文件夹；",
            content: `import pandas as pd
#读取一个Excel文件，并将读取到的数据存储在变量data中
data = __________
#打印出数据集的前5行
print(data.head())

#处理数据集中的缺失值
initial_row_count = __________   #处理前的数据行数
data = __________                #删除缺失值所在行
final_row_count = __________     #处理后的数据行数
print(f'处理后数据行数: {final_row_count}, 删除的行数: {initial_row_count - final_row_count}')

#删除重复行
data = __________

from sklearn.preprocessing import StandardScaler
numerical_features = ['4.您的月生活费○≦1,000元   ○1,001-2,000元   ○2,001-3,000元   ○≧3,001元']
scaler = StandardScaler()
data[numerical_features] = __________

#选择特征
selected_features = [__________]
X = __________

# 创建目标变量
y = __________

from sklearn.model_selection import train_test_split
# 数据划分（测试集取20%）
X_train, X_test, y_train, y_test = __________(__________, random_state=42)

# 合并处理后得数据，并将其保存（保存中不用额外创建索引）
cleaned_data = __________(__________, axis=1)
__________('2.1.2_cleaned_data.csv', __________)`,
          },
          {
            type: "text",
            questionTitle:
              "(9)制定数据清洗和标注规范，将答案写到答题卷文件中，答题卷文件命名为“2.1.1.docx”，保存到考生文件夹；",
          },
        ],
      },
      {
        id: "2.2.1",
        question: `互联网金融飞速发展，使得个人金融理财变得越来越容易。而其中信用评分技术是一种对贷款申请人（信用卡申请人）做风险评估分值的统计模型，可以根据客户提供的资料、客户的历史数据、第三方平台数据（芝麻分、京东、微信等），对客户的信用进行评估。现要求根据提供的 finance 数据集，补全 2.2.1.ipynb 代码。选择合适的特征，开发一个申请的评分模型，利用测试工具对模型进行测试，并对测试结果进行分析，完成测试报告，并运用工具对错误原因进行纠正。
          数据集说明：
Unnamed : 0 - 索引号。
SeriousDlqin2yrs - 个人在过去两年内是否出现过严重的拖欠（ 1 表示有严重拖欠，0 表示没有）。
RevolvingUtilizationOfUnsecuredLines - 这是指个人未偿还的信用额度与总信用额度的比例。
age - 客户的年龄。
NumberOfTime30-59DaysPastDueNotWorse - 在过去一段时间内，贷款逾期 30 至 59 天的次数。
DebtRatio - 债务比率。
Monthly Income - 客户的月收入。
NumberOfOpenCreditLinesAndLoans - 正在使用的信贷账户或贷款的数量。
NumberOfTimes90DaysLate - 贷款逾期超过 90 天的次数。
NumberRealEstateLoansOrLines - 持有的房地产相关贷款或信贷的数量。
NumberOfTime60-89DaysPastDueNotWorse - 贷款逾期 60 至 89 天的次数。
NumberOfDependents - 家庭中依赖该个人的人数。
`,
        todo: [
          {
            type: "code",
            questionTitle: `（1）正确加载数据集，显示前五行的数据。
（2）使用Logistic 模型进行模型训练，要求设定自变量和因变量，并根据自变量特征进行模型训练，最终将训练好的模型以文件名 2.2.1_model.pkl保存到考生文件夹，结果文件以
2.2.1_results.txt 保存到考生文件夹。
（3）使用测试工具对模型进行测试，并记录测试结果，命名 2.2.1_report.txt，保存到考生文件夹
（4）对测试结果进行详细分析，并编写测试报告，包括模型性能评估、错误分析及改进建议，将答案写到答题卷文件中，答题卷文件命名为“2.2.1.docx ”，保存到考生文件夹。
（5）运用工具分析算法中错误案例产生的原因并进行纠正，重新得到模型训练结果，以文
 

件名 2.2.1_results_xg.txt 保存到考生文件夹。
（6）将以上代码以及运行结果， 以 html格式保存并命名为 2.2.1.html，保存到考生文件夹，考生文件夹命名为“准考证号+身份证后 6 位 ”。
`,
            content: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pickle
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE

# 加载数据
data = __________

# 显示前五行的数据
print(__________)

# 选择自变量和因变量
X = data.drop(['SeriousDlqin2yrs', 'Unnamed: 0'], axis=1)
y = data['SeriousDlqin2yrs']

# 分割训练集和测试集（测试集20%）
X_train, X_test, y_train, y_test = __________(__________, random_state=42)

# 训练Logistic回归模型（最大迭代次数为1000次）
model = __________
#训练 Logistic 回归模型
__________

# 保存模型
with open('2.2.1_model.pkl', 'wb') as file:
    pickle.__________

# 预测并保存结果
y_pred = __________
pd.DataFrame(y_pred, columns=['预测结果']).to_csv('2.2.1_results.txt', index=False)

# 生成测试报告
report = classification_report(y_test, y_pred, zero_division=1)
with open('2.2.1_report.txt', 'w') as file:
    file.write(report)

# 分析测试结果
accuracy = __________
print(f"模型准确率: {accuracy:.2f}")

# 处理数据不平衡
smote = SMOTE(random_state=42)
X_resampled, y_resampled = __________

# 重新训练模型
__________
# 重新预测
y_pred_resampled = __________

# 保存新结果
pd.DataFrame(y_pred_resampled, columns=['预测结果']).to_csv('2.2.1_results_xg.txt', index=False)

# 生成新的测试报告
report_resampled = classification_report(y_test, y_pred_resampled, zero_division=1)
with open('2.2.1_report_xg.txt', 'w') as file:
    file.write(report_resampled)

# 分析新的测试结果
accuracy_resampled = __________
print(f"重新采样后的模型准确率: {accuracy_resampled:.2f}")
`,
          },
          {
            type: "text",
            questionTitle:
              "对测试结果进行详细分析，并编写测试报告，包括模型性能评估、错误分析及改进建议，将答案写到答题卷文件中，答题卷文件命名为“2.2.1.docx ”，保存到考生文件夹。",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    firstName: "智能系统设计",
    questions: [
      {
        id: "3.1.1",
        question: `智能音箱作为智能家居生态的重要组成部分，近年来经历了爆炸式的增长。随着人工智能技术的成熟，尤其是自然语言处理（NLP）和语音识别技术的进步，智能音箱已经成为许多家庭中不可或缺的智能设备。它们不仅能够播放音乐、提供天气预报和新闻更新，还能控制家中的智能设备，设定提醒，甚至帮助用户购物。然而，随着市场竞争的加剧，智能音箱制造商面临着如何持续优化产品性能，提升用户体验的挑战。数据分析在智能音箱的持续优化中扮演着核心角色。通过对用户行为的深入挖掘，企业可以了解用户偏好、使用模式和潜在的痛点。例如，分析用户何时最常使用智能音箱、他们最喜欢的功能是什么、以及哪些功能的响应时间过长等问题，可以帮助企业做出有针对性的改进决策。`,
        todo: [
          {
            type: "text",
            questionTitle: `（1）你作为人工智能训练师，根据给定的数据集（智能音箱数据集.xlsx），从以下三方面：用户使用习惯：分析哪些功能最常被使用；功能使用频率：识别最受欢迎的功能和较少使用的功能；响应时间：考察不同功能的平均响应时间，找出可能的瓶颈。给出一份在用户使用习惯、功能使用频率和响应时间方面的分析报告，将其保存为 docx 文件，命名为 3.1.1-1.docx。
（2）为了进一步提升用户体验，给出智能音箱产品的 3 个优化方向和对应解决方案，将其保存为 docx 文件，命名为 3.1.1-2.docx。
`,
          },
        ],
      },
      {
        id: "3.2.1",
        question: `图像识别评估系统是在深度学习技术日益成熟的背景下发展起来的，旨在解决传统图像识别方法在面对复杂场景和大规模数据集时的局限性。随着互联网和物联网技术的飞速发展，图像数据量呈指数级增长，对图像内容的自动理解和智能分析提出了更高的要求。ResNet 作为一种深度卷积神经网络架构，凭借其深度残差连接机制，能够有效缓解梯度消失问题，实现更深层次的网络结构，从而捕获更加丰富和抽象的图像特征，极大地提高了图像识别的准确性和效率，推动了人工智能技术在现实世界中的广泛应用和商业化进程。
AI模型说明： “resnet.onnx ”模型是使用 Pytorch 框架和基于深度卷积神经网络网络训练得到的，专门用于进行图像识别。对应的标签文件为“labels.txt ”。该模型的使用交互流程为：
1)加载“resnet.onnx ”模型和“labels.txt ”类别标签；
2)加载本地测试图片“ img_test.jpg ”，并进行预处理图像以符合模型输入要求；
3)使用“resnet.onnx ”模型对加载的图片进行识别；
4)输出加载图片的识别结果（输出概率值最大的 5 组类别和对应概率值）你作为一名人工智能训练师，请完成以下工作任务：
`,
        todo: [
          {
            type: "code",
            questionTitle: `（1）补全该模型的使用交互流程对应的 Python 代码（3.2.1.ipynb），实现本地测试图片“img_test.jpg ”的识别，将其识别结果截图保存为 jpg 格式文件，命名为 3.2.1-1.jpg。
`,
            content: `import onnxruntime as ort
import numpy as np
import scipy.special
from PIL import Image


# 预处理图像
def preprocess_image(image, resize_size=256, crop_size=224, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]):
  image = image.resize((resize_size, resize_size), Image.BILINEAR)
  w, h = image.size
  left = (w - crop_size) / 2
  top = (h - crop_size) / 2
  image = image.crop((left, top, left + crop_size, top + crop_size))
  image = np.array(image).astype(np.float32)
  image = image / 255.0
  image = (image - mean) / std
  image = np.transpose(image, (2, 0, 1))
  image = image.reshape((1,) + image.shape)
  return image


# 模型加载 2分
session = _________________


# 加载类别标签
labels_path = 'labels.txt'
with open(labels_path) as f:
  labels = [line.strip() for line in f.readlines()]


# 获取模型输入和输出的名称
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name


# 加载图片 2分
image = _________________('RGB')


# 预处理图片 2分
processed_image = _________________


# 确保输入数据是 float32 类型
processed_image = processed_image.astype(np.float32)


# 进行图片识别 2分
output = _________________([output_name], {input_name: processed_image})[0]


# 应用 softmax 函数获取概率 2分
probabilities = _________________(output, axis=-1)


# 获取最高的5个概率和对应的类别索引 3分
top5_idx = _________________[-5:][::-1]
top5_prob = _________________


# 打印结果
print("Top 5 predicted classes:")
for i in range(5):
  print(f"{i+1}: {labels[top5_idx[i]]} - Probability: {top5_prob[i]}")
`,
          },
          {
            type: "text",
            questionTitle: `（2）在上面的使用交互流程基础上，给出在图像识别评估系统中使用“resnet.onnx ”模型的一种人机交互的最优方式，将其保存为 docx 文件，命名为 3.2.1.docx。`,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    firstName: "培训与指导",
    questions: [
      {
        id: "4.1.1",
        question: `A 企业是一家康复训练机构，需要利用人工智能技术为康复患者提供个性化的康复训练计划，并实时监控训练效果。为了提高人工智能技术的应用效果，现计划对新进技术人员进行数据标注的培训。这次培训，将会使新进技术人员掌握Label studio 标注工具的使用，能对文本、图像、视频、音频进行标注，达到人工智能训练师五级/初级工的技能水平。
请你根据要求补全素材 4.1.1.docx 中的培训大纲。
`,
        todo: [
          {
            type: "docx",
            questionTitle: `（1）根据要求补全素材 4.1.1.docx 中的培训大纲。`,
            content: `引言
学习目标：了解数据标注的重要性和应用场景。
内容：
介绍人工智能在康复训练中的应用，数据标注在个性化康复训练计划中的作用。

数据标注基础理论
学习目标：________________________
内容：
什么是数据标注？
数据标注的类型：文本、图像、视频、音频。
数据标注在人工智能中的作用和重要性。

Label Studio简介与安装
学习目标：______________________
内容：
Label Studio简介及应用场景。
安装与配置Label Studio。
Label Studio界面介绍和基本操作。

文本数据标注
学习目标：________________________
内容：
文本标注类型：命名实体识别、情感分析等。
Label Studio文本标注功能演示。
实践操作：标注一个文本数据集。

图像数据标注
学习目标：________________________
内容：
图像标注类型：图像分类、目标检测、图像分割等。
Label Studio图像标注功能演示。
实践操作：标注一个图像数据集。

视频数据标注
学习目标：________________________
内容：
视频标注类型：动作识别、事件检测等。
Label Studio视频标注功能演示。
实践操作：标注一个视频数据集。

音频数据标注
学习目标：掌握音频数据标注的方法和技巧。
内容：
音频标注类型：语音识别、情感分析等。
Label Studio音频标注功能演示。
实践操作：标注一个音频数据集。

综合项目实践
学习目标：综合运用所学知识进行数据标注项目。
内容：
项目介绍：为康复训练项目进行多模态数据标注（包括文本、图像、视频、音频）。
数据标注：学员分组进行实际数据标注任务。
项目评审：展示标注成果，讲解标注思路和遇到的问题。

总结与答疑
学习目标：巩固所学内容，解决学员疑问。
内容：培训内容总结，关键点回顾，学员提问与解答。

评估测试
学习目标：评估学员掌握的数据标注技能。
内容：
理论测试：关于数据标注基本概念和Label Studio使用的笔试。
实操测试：要求学员完成指定的数据标注任务。`,
          },
        ],
      },
    ],
  },
];
